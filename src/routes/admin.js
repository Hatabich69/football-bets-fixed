import express from 'express';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
const router = express.Router();
router.post('/bets/:id/settle', requireAuth, requireAdmin, async (req,res)=>{
 const {result} = req.body;
 const betId = req.params.id;
 const [rows]=await pool.query('SELECT * FROM bets WHERE id=?',[betId]);
 if(!rows.length) return res.status(404).json({error:'Bet not found'});
 const bet = rows[0];
 if(bet.status!=='open') return res.status(400).json({error:'Bet already settled'});
 let credit=0; if(result==='win') credit=Number(bet.stake)*Number(bet.price);
 await pool.query('UPDATE bets SET status=? WHERE id=?',[result,betId]);
 if(credit>0){ await pool.query('UPDATE users SET balance=balance+? WHERE id=?',[credit,bet.user_id]); }
 res.json({settled:true, credit});
});
export default router;
