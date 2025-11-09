import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  const [[user]] = await pool.query(
    'SELECT id, username, email, role, balance, created_at FROM users WHERE id=?',
    [req.user.id]
  );
  if (!user) return res.status(404).json({ error: 'User not found' });

  const [[stats]] = await pool.query(
    `SELECT
       COUNT(*) AS total_bets,
       SUM(CASE WHEN status='win' THEN 1 ELSE 0 END) AS wins,
       SUM(CASE WHEN status='lose' THEN 1 ELSE 0 END) AS loses
     FROM bets WHERE user_id=?`,
    [req.user.id]
  );

  res.json({ user, stats });
});

router.post('/deposit', requireAuth, async (req, res) => {
  const { amount } = req.body;
  const val = Number(amount);
  if (!val || val <= 0)
    return res.status(400).json({ error: 'Invalid amount' });

  await pool.query(
    'UPDATE users SET balance = balance + ? WHERE id=?',
    [val, req.user.id]
  );
  await pool.query(
    'INSERT INTO transactions (user_id, type, amount) VALUES (?, "deposit", ?)',
    [req.user.id, val]
  );

  const [[{ balance }]] = await pool.query(
    'SELECT balance FROM users WHERE id=?',
    [req.user.id]
  );

  res.json({ balance });
});

export default router;
