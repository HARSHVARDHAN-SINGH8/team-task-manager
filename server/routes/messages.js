import express from 'express';
import pool from '../config/db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// Get all conversations (users you've messaged or been messaged by)
router.get('/conversations', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [convos] = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        m.content AS last_message,
        m.created_at AS last_message_at,
        m.sender_id,
        (SELECT COUNT(*) FROM messages WHERE receiver_id = ? AND sender_id = u.id AND is_read = FALSE) AS unread_count
      FROM users u
      JOIN messages m ON (
        (m.sender_id = ? AND m.receiver_id = u.id) OR
        (m.receiver_id = ? AND m.sender_id = u.id)
      )
      WHERE u.id != ?
      AND m.id = (
        SELECT MAX(id) FROM messages 
        WHERE (sender_id = ? AND receiver_id = u.id) OR (receiver_id = ? AND sender_id = u.id)
      )
      ORDER BY m.created_at DESC
    `, [userId, userId, userId, userId, userId, userId]);

    res.json(convos);
  } catch (error) { next(error); }
});

// Get messages with a specific user
router.get('/:userId', async (req, res, next) => {
  try {
    const myId = req.user.id;
    const otherId = parseInt(req.params.userId);

    // Mark received messages as read
    await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ?',
      [otherId, myId]
    );

    const [messages] = await pool.query(`
      SELECT m.*, u.name AS sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [myId, otherId, otherId, myId]);

    res.json(messages);
  } catch (error) { next(error); }
});

// Send a message
router.post('/:userId', async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const receiverId = parseInt(req.params.userId);
    const { content } = req.body;

    if (!content?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [senderId, receiverId, content.trim()]
    );

    const [[message]] = await pool.query(
      'SELECT m.*, u.name AS sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?',
      [result.insertId]
    );

    res.status(201).json(message);
  } catch (error) { next(error); }
});

// Get all workspace users (to start new conversations)
router.get('/users/all', async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email FROM users WHERE id != ? ORDER BY name ASC',
      [req.user.id]
    );
    res.json(users);
  } catch (error) { next(error); }
});

export default router;
