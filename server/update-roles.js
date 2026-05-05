import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function updateRoles() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'yourpassword',
      database: process.env.DB_NAME || 'taskmanager'
    });

    console.log('Connected to database.');

    // First, map existing 'member' role to 'editor'
    await connection.query("UPDATE project_members SET role = 'admin' WHERE role = 'admin';"); // Ensure admin stays admin
    // Note: Since 'member' is about to be invalid, we need to handle it.
    // However, MySQL won't let us set it to 'editor' if 'editor' isn't in the ENUM yet.
    // So we add 'editor' to the enum first, then update, then remove 'member'.
    
    await connection.query("ALTER TABLE project_members MODIFY COLUMN role ENUM('admin', 'member', 'editor', 'commenter', 'viewer') DEFAULT 'viewer';");
    console.log('Added new roles to enum.');

    await connection.query("UPDATE project_members SET role = 'editor' WHERE role = 'member';");
    console.log("Mapped 'member' to 'editor'.");

    await connection.query("ALTER TABLE project_members MODIFY COLUMN role ENUM('admin', 'editor', 'commenter', 'viewer') DEFAULT 'viewer';");
    console.log('Removed old member role from enum.');

    await connection.end();
  } catch (error) {
    console.error('Error updating roles:', error);
  }
}

updateRoles();
