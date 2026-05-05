import express from 'express';
import pool from '../config/db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const query = `%${req.query.q}%`;
    
    // Search Projects
    const [projects] = await pool.query(`
      SELECT p.* 
      FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = ? AND (p.name LIKE ? OR p.description LIKE ?)
    `, [req.user.id, query, query]);

    // Search Tasks
    const [tasks] = await pool.query(`
      SELECT t.*, p.name as project_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = ? AND (t.title LIKE ? OR t.description LIKE ?)
    `, [req.user.id, query, query]);

    res.json({ projects, tasks });
  } catch (error) { next(error); }
});

export default router;
