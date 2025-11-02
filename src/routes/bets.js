import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
const router = express.Router();
router.post('/', requireAuth, async (req,res)=>{
 const {match_id, selection, stake, price} = req.body;
 if(!match_id||!selection||!stake||!price) return res.status(400).json({error:'Missing fields'});
 const [u]=await pool.query('SELECT balance FROM users WHERE id=?',[req.user.id]);
 const balance = Number(u[0]?.balance||0);
 if(Number(stake)>balance) return res.status(400).json({error:'Insufficient balance'});
 const [r]=await pool.query('INSERT INTO bets (user_id,match_id,selection,stake,price,status) VALUES (?,?,?,?,?,"open")',[req.user.id,match_id,selection,stake,price]);
 await pool.query('UPDATE users SET balance=balance-? WHERE id=?',[stake,req.user.id]);
 res.json({id:r.insertId, balance_after: balance-Number(stake)});
});
router.get('/me', requireAuth, async (req,res)=>{
 const [rows]=await pool.query('SELECT * FROM bets WHERE user_id=? ORDER BY created_at DESC',[req.user.id]);
 res.json(rows);
});
export default router;
