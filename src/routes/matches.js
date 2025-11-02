import express from 'express';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
const router = express.Router();
router.get('/', async (req,res)=>{ const [rows]=await pool.query('SELECT id,home_team,away_team,kickoff_at,status FROM matches ORDER BY kickoff_at DESC'); res.json(rows); });
router.get('/:id/odds', async (req,res)=>{ const [rows]=await pool.query('SELECT id,market,selection,price FROM odds WHERE match_id=?',[req.params.id]); res.json(rows); });
router.post('/', requireAuth, requireAdmin, async (req,res)=>{ const {home_team,away_team,kickoff_at,status}=req.body; if(!home_team||!away_team||!kickoff_at) return res.status(400).json({error:'Missing fields'}); const [r]=await pool.query('INSERT INTO matches (home_team,away_team,kickoff_at,status) VALUES (?,?,?,?)',[home_team,away_team,kickoff_at,status||'scheduled']); res.json({id:r.insertId}); });
router.post('/:id/odds', requireAuth, requireAdmin, async (req,res)=>{ const {market,selection,price}=req.body; if(!market||!selection||!price) return res.status(400).json({error:'Missing fields'}); const [r]=await pool.query('INSERT INTO odds (match_id,market,selection,price) VALUES (?,?,?,?)',[req.params.id,market,selection,price]); res.json({id:r.insertId}); });
export default router;
