import express from 'express';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/users', requireAuth, requireAdmin, async (_req, res) => {
  const [rows] = await pool.query(
    'SELECT id, username, email, role, balance, created_at FROM users ORDER BY created_at DESC'
  );
  res.json(rows);
});

router.get('/bets', requireAuth, requireAdmin, async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT b.*, u.username, m.home_team, m.away_team
     FROM bets b
     JOIN users u ON b.user_id=u.id
     JOIN matches m ON b.match_id=m.id
     ORDER BY b.created_at DESC`
  );
  res.json(rows);
});

router.post('/bets/:id/settle', requireAuth, requireAdmin, async (req, res) => {
  const { result } = req.body;
  const betId = req.params.id;

  const [[bet]] = await pool.query('SELECT * FROM bets WHERE id=?', [betId]);
  if (!bet) return res.status(404).json({ error: 'Bet not found' });
  if (bet.status !== 'open')
    return res.status(400).json({ error: 'Bet already settled' });

  let credit = 0;
  if (result === 'win') {
    credit = Number(bet.stake) * Number(bet.price);
    await pool.query(
      'UPDATE users SET balance = balance + ? WHERE id=?',
      [credit, bet.user_id]
    );
    await pool.query(
      'INSERT INTO transactions (user_id, type, amount) VALUES (?, "win_payout", ?)',
      [bet.user_id, credit]
    );
  } else if (result === 'void') {
    await pool.query(
      'UPDATE users SET balance = balance + ? WHERE id=?',
      [bet.stake, bet.user_id]
    );
    await pool.query(
      'INSERT INTO transactions (user_id, type, amount) VALUES (?, "refund", ?)',
      [bet.user_id, bet.stake]
    );
  }

  await pool.query(
    'UPDATE bets SET status=? WHERE id=?',
    [result, betId]
  );

  res.json({ settled: true, credit });
});

export default router;
