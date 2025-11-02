import jwt from 'jsonwebtoken';
export function requireAuth(req,res,next){const a=req.headers.authorization||'';const t=a.startsWith('Bearer ')?a.slice(7):null;if(!t)return res.status(401).json({error:'Unauthorized'});try{req.user=jwt.verify(t,process.env.JWT_SECRET||'dev_secret');next();}catch(e){return res.status(401).json({error:'Invalid token'});} }
export function requireAdmin(req,res,next){ if(req.user?.role!=='admin') return res.status(403).json({error:'Forbidden (admin only)'}); next(); }
