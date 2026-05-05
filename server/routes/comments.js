import express from 'express';
import pool from '../config/db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// Get all comments for a task
router.get('/task/:taskId', async (req, res, next) => {
  try {
    const [comments] = await pool.query(`
      SELECT tc.*, u.name as user_name 
      FROM task_comments tc 
      JOIN users u ON tc.user_id = u.id 
      WHERE tc.task_id = ?
      ORDER BY tc.created_at DESC
    `, [req.params.taskId]);
    res.json(comments);
  } catch (error) { next(error); }
});

// Add comment to task (must be member with at least commenter role)
router.post('/task/:taskId', async (req, res, next) => {
  try {
    const { comment } = req.body;
    if (!comment) return res.status(400).json({ message: 'Comment text is required' });

    const [tasks] = await pool.query('SELECT project_id FROM tasks WHERE id = ?', [req.params.taskId]);
    if (tasks.length === 0) return res.status(404).json({ message: 'Task not found' });
    const projectId = tasks[0].project_id;

    // Verify role
    const [members] = await pool.query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    if (members.length === 0 || !['admin', 'editor', 'commenter'].includes(members[0].role)) {
      return res.status(403).json({ message: 'You do not have permission to comment on this project' });
    }

    const [result] = await pool.query(
      'INSERT INTO task_comments (task_id, user_id, comment) VALUES (?, ?, ?)',
      [req.params.taskId, req.user.id, comment]
    );

    res.status(201).json({ id: result.insertId, comment, user_id: req.user.id });
  } catch (error) { next(error); }
});

export default router;
