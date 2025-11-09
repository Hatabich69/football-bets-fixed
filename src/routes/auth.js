import express from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'Missing fields' });

    const [exists] = await pool.query(
      'SELECT id FROM users WHERE email=? OR username=?',
      [email, username]
    );
    if (exists.length)
      return res.status(409).json({ error: 'User already exists' });

    const hash = await hashPassword(password);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, role, balance) VALUES (?, ?, ?, "user", 1000.00)',
      [username, email, hash]
    );

    res.json({ id: result.insertId, username, email });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query(
      'SELECT id, username, email, password_hash, role, balance FROM users WHERE email=?',
      [email]
    );
    if (!rows.length)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const ok = await comparePassword(password, user.password_hash);
    if (!ok)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        balance: user.balance
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
