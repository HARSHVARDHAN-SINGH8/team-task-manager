import express from 'express';
import pool from '../config/db.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin, requireEditor } from '../middleware/role.js';

const router = express.Router();
router.use(auth);

// Get all tasks assigned to the current user
router.get('/me', async (req, res, next) => {
  try {
    const [tasks] = await pool.query(`
      SELECT t.*, 
             p.name as project_name, 
             pc.name as list_name,
             (SELECT COUNT(*) FROM task_comments tc WHERE tc.task_id = t.id) as comment_count
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN project_columns pc ON t.list_id = pc.id
      WHERE t.assigned_to = ?
      ORDER BY t.due_date ASC
    `, [req.user.id]);
    res.json(tasks);
  } catch (error) { next(error); }
});

// Get all tasks in a project
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const userId = req.user.id;

    // Get user role in project
    const [members] = await pool.query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (members.length === 0) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    const role = members[0].role;
    let query = `
      SELECT t.*, 
             pc.name as list_name,
             u.name as assigned_name,
             (SELECT COUNT(*) FROM task_comments tc WHERE tc.task_id = t.id) as comment_count
      FROM tasks t
      LEFT JOIN project_columns pc ON t.list_id = pc.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = ? 
    `;
    const params = [projectId];

    // If user is not admin or editor, restrict to assigned tasks only
    if (role !== 'admin' && role !== 'editor') {
      query += ' AND t.assigned_to = ?';
      params.push(userId);
    }

    query += ' ORDER BY t.created_at DESC';

    const [tasks] = await pool.query(query, params);
    res.json(tasks);
  } catch (error) { next(error); }
});

// Create task (admin only)
router.post('/project/:projectId', requireAdmin, async (req, res, next) => {
  try {
    const { title, description, due_date, priority, assigned_to, status, list_id } = req.body;
    
    // Default status to a valid enum value if not provided
    const taskStatus = status || 'todo';
    
    // Default assignee to the creator if not specified
    const finalAssignedTo = assigned_to || req.user.id;

    const [result] = await pool.query(
      'INSERT INTO tasks (project_id, title, description, due_date, priority, assigned_to, status, list_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.params.projectId, title, description, due_date, priority, finalAssignedTo, taskStatus, list_id]
    );

    await pool.query(
      'INSERT INTO activity_logs (project_id, user_id, action) VALUES (?, ?, ?)',
      [req.params.projectId, req.user.id, `Created task "${title}"`]
    );

    res.status(201).json({ 
      id: result.insertId, 
      title, 
      description, 
      due_date, 
      priority, 
      assigned_to: finalAssignedTo, 
      status: taskStatus, 
      list_id 
    });
  } catch (error) { next(error); }
});

// Update task
router.put('/:id', async (req, res, next) => {
  try {
    const fields = req.body;
    const taskId = req.params.id;
    const userId = req.user.id;

    // Get current task data first
    const [currentTasks] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (currentTasks.length === 0) return res.status(404).json({ message: 'Task not found' });
    const currentTask = currentTasks[0];

    // GET USER ROLE IN PROJECT
    const [projectMember] = await pool.query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [currentTask.project_id, userId]
    );
    
    if (projectMember.length === 0) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }
    
    const userRole = projectMember[0].role;
    const isAssignee = currentTask.assigned_to === userId;

    // PERMISSION CHECK: Admin/Editor can update any task, Members (others) only their assigned tasks
    if (userRole !== 'admin' && userRole !== 'editor' && !isAssignee) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you.' });
    }

    // DRAG AND DROP / MOVE RESTRICTION: Only project admin can change list_id or status
    if (fields.list_id !== undefined || fields.status !== undefined) {
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Only project admins can move tasks between lists." });
      }
    }

    // RULE: Strictly only the assigned user can change completion status (even admins if they aren't assigned)
    if (fields.is_completed !== undefined) {
      if (!isAssignee) {
        return res.status(403).json({ message: "Only the person assigned to this task can mark it as complete or incomplete." });
      }
    }

    // Build dynamic UPDATE query
    const updates = [];
    const values = [];
    
    const updatableFields = ['title', 'description', 'due_date', 'priority', 'assigned_to', 'status', 'list_id', 'is_completed'];
    updatableFields.forEach(field => {
      if (fields[field] !== undefined) {
        // Prevent clearing the assignee
        if (field === 'assigned_to' && (fields[field] === '' || fields[field] === null)) {
          return;
        }
        updates.push(`${field} = ?`);
        values.push(fields[field]);
      }
    });

    if (updates.length === 0) return res.json({ message: 'No changes made' });

    values.push(taskId);
    await pool.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Log activity if title changed or if it was a significant move
    const newTitle = fields.title || currentTask.title;
    let action = `Updated task "${newTitle}"`;
    if (fields.list_id && fields.list_id !== currentTask.list_id) {
      action = `Moved task "${newTitle}" to a different list`;
    }

    await pool.query(
      'INSERT INTO activity_logs (project_id, user_id, action) VALUES (?, ?, ?)',
      [currentTask.project_id, req.user.id, action]
    );

    res.json({ message: 'Task updated' });
  } catch (error) { next(error); }
});

// Delete task
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const [task] = await pool.query('SELECT project_id, title FROM tasks WHERE id = ?', [taskId]);
    
    if (task.length === 0) return res.status(404).json({ message: 'Task not found' });

    const projectId = task[0]?.project_id;
    const taskTitle = task[0]?.title;

    await pool.query('DELETE FROM tasks WHERE id = ?', [taskId]);

    if (projectId) {
      await pool.query(
        'INSERT INTO activity_logs (project_id, user_id, action) VALUES (?, ?, ?)',
        [projectId, req.user.id, `Deleted task "${taskTitle}"`]
      );
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) { next(error); }
});

// Get dashboard analytics for a specific project
router.get('/project/:projectId/dashboard', async (req, res, next) => {
  try {
    const [members] = await pool.query('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?', [req.params.projectId, req.user.id]);
    if (members.length === 0) return res.status(403).json({ message: 'Access denied' });

    const [tasks] = await pool.query(`
      SELECT t.*, pc.name as list_name 
      FROM tasks t 
      LEFT JOIN project_columns pc ON t.list_id = pc.id
      WHERE t.project_id = ?
    `, [req.params.projectId]);

    const total = tasks.length;
    const byStatus = {};
    const perUser = {};
    const completedPerUser = {};
    const byPriority = { high: 0, medium: 0, low: 0 };
    const overdue = [];
    const upcoming = [];
    const createdPerDay = {};
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    // Initialize last 7 days for the chart
    for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      createdPerDay[d.toISOString().split('T')[0]] = 0;
    }

    let completedTasks = 0;

    tasks.forEach(t => {
      const statusName = t.list_name || t.status || 'Unassigned';
      byStatus[statusName] = (byStatus[statusName] || 0) + 1;

      const priority = t.priority || 'medium';
      byPriority[priority] = (byPriority[priority] || 0) + 1;

      const isDone = t.is_completed === 1;
      if (isDone) completedTasks++;

      if (t.assigned_to) {
        perUser[t.assigned_to] = (perUser[t.assigned_to] || 0) + 1;
        if (isDone) {
          completedPerUser[t.assigned_to] = (completedPerUser[t.assigned_to] || 0) + 1;
        }
      }
      
      if (t.due_date && !isDone) {
        const dueDate = new Date(t.due_date);
        if (dueDate < today) {
          overdue.push(t);
        } else if (dueDate <= nextWeek) {
          upcoming.push(t);
        }
      }

      if (t.created_at) {
        const dateKey = new Date(t.created_at).toISOString().split('T')[0];
        if (createdPerDay[dateKey] !== undefined) {
          createdPerDay[dateKey]++;
        }
      }
    });

    res.json({ total, byStatus, perUser, completedPerUser, byPriority, overdue, upcoming, createdPerDay, completedTasks });
  } catch (error) { next(error); }
});

export default router;
