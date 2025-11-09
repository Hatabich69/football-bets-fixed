import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  const { match_id, selection, stake, price } = req.body;
  if (!match_id || !selection || !stake || !price)
    return res.status(400).json({ error: 'Missing fields' });

  const [u] = await pool.query(
    'SELECT balance FROM users WHERE id=?',
    [req.user.id]
  );
  const balance = Number(u[0]?.balance || 0);
  if (Number(stake) > balance)
    return res.status(400).json({ error: 'Insufficient balance' });

  const [bet] = await pool.query(
    'INSERT INTO bets (user_id, match_id, selection, stake, price, status) VALUES (?, ?, ?, ?, ?, "open")',
    [req.user.id, match_id, selection, stake, price]
  );

  await pool.query(
    'UPDATE users SET balance = balance - ? WHERE id=?',
    [stake, req.user.id]
  );

  await pool.query(
    'INSERT INTO transactions (user_id, type, amount) VALUES (?, "bet_stake", ?)',
    [req.user.id, stake]
  );

  res.json({ id: bet.insertId, balance_after: balance - Number(stake) });
});

router.get('/me', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT b.*, m.home_team, m.away_team FROM bets b JOIN matches m ON b.match_id=m.id WHERE b.user_id=? ORDER BY b.created_at DESC',
    [req.user.id]
  );
  res.json(rows);
});

export default router;
