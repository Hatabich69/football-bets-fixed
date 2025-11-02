import bcrypt from 'bcrypt';
export async function hashPassword(p){return await bcrypt.hash(p,10);} 
export async function comparePassword(p,h){return await bcrypt.compare(p,h);} 
