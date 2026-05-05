import express from 'express';
import pool from '../config/db.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();
router.use(auth);

// Get global summary for all projects user is part of
router.get('/summary', async (req, res, next) => {
  try {
    const [summary] = await pool.query(`
      SELECT 
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(t.id) as total_tasks,
        SUM(CASE WHEN t.is_completed = 1 THEN 1 ELSE 0 END) as completed_tasks
      FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE pm.user_id = ?
    `, [req.user.id]);

    const [distribution] = await pool.query(`
      SELECT pc.name as status, COUNT(t.id) as count
      FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      JOIN project_columns pc ON p.id = pc.project_id
      LEFT JOIN tasks t ON pc.id = t.list_id
      WHERE pm.user_id = ?
      GROUP BY pc.name
    `, [req.user.id]);

    res.json({ ...summary[0], distribution });
  } catch (error) { next(error); }
});

// Get all projects for logged in user
router.get('/', async (req, res, next) => {
  try {
    const [projects] = await pool.query(`
      SELECT p.*, pm.role 
      FROM projects p 
      JOIN project_members pm ON p.id = pm.project_id 
      WHERE pm.user_id = ?
    `, [req.user.id]);
    res.json(projects);
  } catch (error) { next(error); }
});

// Create project, auto-add creator as admin, log activity
router.post('/', async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { name, description } = req.body;

    const [projectResult] = await connection.query(
      'INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)',
      [name, description, req.user.id]
    );
    const projectId = projectResult.insertId;

    await connection.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, req.user.id, 'admin']
    );

    await connection.query(
      'INSERT INTO activity_logs (project_id, user_id, action) VALUES (?, ?, ?)',
      [projectId, req.user.id, 'Created project']
    );

    await connection.commit();
    res.status(201).json({ id: projectId, name, description, created_by: req.user.id });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

// Get single project with members list
router.get('/:id', async (req, res, next) => {
  try {
    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (projects.length === 0) return res.status(404).json({ message: 'Project not found' });

    const [members] = await pool.query(`
      SELECT u.id, u.name, u.email, pm.role 
      FROM project_members pm 
      JOIN users u ON pm.user_id = u.id 
      WHERE pm.project_id = ?
    `, [req.params.id]);

    const [columns] = await pool.query('SELECT * FROM project_columns WHERE project_id = ? ORDER BY position ASC', [req.params.id]);

    res.json({ ...projects[0], members, columns });
  } catch (error) { next(error); }
});

// Add column (admin/editor)
router.post('/:id/columns', async (req, res, next) => {
  try {
    const { name } = req.body;
    const [lastCol] = await pool.query('SELECT MAX(position) as maxPos FROM project_columns WHERE project_id = ?', [req.params.id]);
    const position = (lastCol[0].maxPos || 0) + 1;
    
    const [result] = await pool.query('INSERT INTO project_columns (project_id, name, position) VALUES (?, ?, ?)', [req.params.id, name, position]);
    res.status(201).json({ id: result.insertId, name, position });
  } catch (error) { next(error); }
});

// Delete column (admin/editor)
router.delete('/:id/columns/:columnId', async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Get first column to move tasks to
    const [cols] = await connection.query('SELECT id FROM project_columns WHERE project_id = ? ORDER BY position ASC LIMIT 1', [req.params.id]);
    
    if (cols.length > 0 && cols[0].id !== parseInt(req.params.columnId)) {
      await connection.query('UPDATE tasks SET list_id = ? WHERE list_id = ?', [cols[0].id, req.params.columnId]);
    } else if (cols.length > 1) {
       // If deleting the first column, move to second
       await connection.query('UPDATE tasks SET list_id = ? WHERE list_id = ?', [cols[1].id, req.params.columnId]);
    } else {
      // No other columns, maybe delete tasks? For now just let them be or delete.
      await connection.query('DELETE FROM tasks WHERE list_id = ?', [req.params.columnId]);
    }

    await connection.query('DELETE FROM project_columns WHERE id = ? AND project_id = ?', [req.params.columnId, req.params.id]);
    
    await connection.commit();
    res.json({ message: 'Column deleted and tasks moved' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

// Get progress
router.get('/:id/progress', async (req, res, next) => {
  try {
    const [tasks] = await pool.query('SELECT status FROM tasks WHERE project_id = ?', [req.params.id]);
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const percentage = total === 0 ? 0 : Math.round((done / total) * 100);
    res.json({ total, done, percentage });
  } catch (error) { next(error); }
});

// Add member by email (admin only)
router.post('/:id/members', requireAdmin, async (req, res, next) => {
  try {
    const { email, role = 'viewer' } = req.body;
    const [users] = await pool.query('SELECT id, name FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const user = users[0];
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [req.params.id, user.id, role]
    );

    await pool.query(
      'INSERT INTO activity_logs (project_id, user_id, action) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, `Invited ${user.name} as ${role}`]
    );
    res.status(201).json({ message: 'Member added' });
  } catch (error) { next(error); }
});

// Update member role (admin only)
router.put('/:id/members/:userId', requireAdmin, async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'editor', 'commenter', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    await pool.query(
      'UPDATE project_members SET role = ? WHERE project_id = ? AND user_id = ?',
      [role, req.params.id, req.params.userId]
    );

    await pool.query(
      'INSERT INTO activity_logs (project_id, user_id, action) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, `Changed role of user ${req.params.userId} to ${role}`]
    );
    res.json({ message: 'Role updated' });
  } catch (error) { next(error); }
});

// Remove member
router.delete('/:id/members/:userId', requireAdmin, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM project_members WHERE project_id = ? AND user_id = ?', [req.params.id, req.params.userId]);
    await pool.query(
      'INSERT INTO activity_logs (project_id, user_id, action) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, `Removed member ID ${req.params.userId}`]
    );
    res.json({ message: 'Member removed' });
  } catch (error) { next(error); }
});

export default router;
