import express from 'express';
import pool from '../config/db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// Get all activities for projects user is member of (Inbox)
router.get('/all', async (req, res, next) => {
  try {
    const [logs] = await pool.query(`
      SELECT al.*, u.name as user_name, p.name as project_name
      FROM activity_logs al
      JOIN users u ON al.user_id = u.id
      JOIN projects p ON al.project_id = p.id
      JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = ?
      ORDER BY al.created_at DESC
      LIMIT 50
    `, [req.user.id]);
    res.json(logs);
  } catch (error) { next(error); }
});

router.get('/project/:projectId', async (req, res, next) => {
  try {
    const [logs] = await pool.query(`
      SELECT al.*, u.name as user_name
      FROM activity_logs al
      JOIN users u ON al.user_id = u.id
      WHERE al.project_id = ?
      ORDER BY al.created_at DESC
      LIMIT 50
    `, [req.params.projectId]);
    res.json(logs);
  } catch (error) { next(error); }
});

export default router;
