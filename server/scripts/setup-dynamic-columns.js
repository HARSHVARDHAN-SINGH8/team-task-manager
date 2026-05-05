import pool from '../config/db.js';

async function setup() {
  try {
    console.log('Setting up dynamic columns...');
    
    // Create project_columns table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_columns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        position INT DEFAULT 0,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // Add list_id to tasks table
    // First check if column exists
    const [cols] = await pool.query('SHOW COLUMNS FROM tasks LIKE "list_id"');
    if (cols.length === 0) {
      await pool.query('ALTER TABLE tasks ADD COLUMN list_id INT');
    }

    // Populate initial columns for existing projects
    const [projects] = await pool.query('SELECT id FROM projects');
    for (const project of projects) {
      const [existingCols] = await pool.query('SELECT id FROM project_columns WHERE project_id = ?', [project.id]);
      if (existingCols.length === 0) {
        // Add default To Do, In Progress, Done
        const [todoRes] = await pool.query('INSERT INTO project_columns (project_id, name, position) VALUES (?, "To Do", 0)', [project.id]);
        const [ipRes] = await pool.query('INSERT INTO project_columns (project_id, name, position) VALUES (?, "In Progress", 1)', [project.id]);
        const [doneRes] = await pool.query('INSERT INTO project_columns (project_id, name, position) VALUES (?, "Done", 2)', [project.id]);

        // Map existing tasks based on status string
        await pool.query('UPDATE tasks SET list_id = ? WHERE project_id = ? AND status = "todo"', [todoRes.insertId, project.id]);
        await pool.query('UPDATE tasks SET list_id = ? WHERE project_id = ? AND status = "inprogress"', [ipRes.insertId, project.id]);
        await pool.query('UPDATE tasks SET list_id = ? WHERE project_id = ? AND status = "done"', [doneRes.insertId, project.id]);
      }
    }

    console.log('Setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setup();
