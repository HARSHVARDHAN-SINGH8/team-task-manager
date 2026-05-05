import pool from '../config/db.js';

const getProjectId = async (req) => {
  let projectId = req.params.projectId || req.body?.project_id || req.query.project_id;
  
  if (!projectId && req.params.id) {
    try {
      if (req.baseUrl.includes('tasks')) {
        const [rows] = await pool.query('SELECT project_id FROM tasks WHERE id = ?', [req.params.id]);
        if (rows && rows.length > 0) {
          projectId = rows[0].project_id;
        }
      } else if (req.baseUrl.includes('comments')) {
        const [rows] = await pool.query(`
          SELECT t.project_id FROM task_comments c 
          JOIN tasks t ON c.task_id = t.id 
          WHERE c.id = ?`, [req.params.id]);
        if (rows && rows.length > 0) {
          projectId = rows[0].project_id;
        }
      } else {
        projectId = req.params.id;
      }
    } catch (err) {
      console.error('Error in getProjectId:', err);
    }
  }
  return projectId;
};

export const requireAdmin = async (req, res, next) => {
  try {
    const projectId = await getProjectId(req);
    if (!projectId) return res.status(400).json({ message: 'Project ID required' });

    const [members] = await pool.query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    if (members.length === 0 || members[0].role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) { next(error); }
};

export const requireEditor = async (req, res, next) => {
  try {
    const projectId = await getProjectId(req);
    if (!projectId) return res.status(400).json({ message: 'Project ID required' });

    const [members] = await pool.query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    if (members.length === 0 || !['admin', 'editor'].includes(members[0].role)) {
      return res.status(403).json({ message: 'Editor/Admin access required' });
    }
    next();
  } catch (error) { next(error); }
};

export const requireCommenter = async (req, res, next) => {
  try {
    const projectId = await getProjectId(req);
    if (!projectId) return res.status(400).json({ message: 'Project ID required' });

    const [members] = await pool.query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    if (members.length === 0 || !['admin', 'editor', 'commenter'].includes(members[0].role)) {
      return res.status(403).json({ message: 'Commenter/Editor/Admin access required' });
    }
    next();
  } catch (error) { next(error); }
};
