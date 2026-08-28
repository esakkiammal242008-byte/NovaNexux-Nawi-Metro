import jwt from 'jsonwebtoken'
const secret = () => process.env.JWT_SECRET || 'novanexus-development-secret'
export function signToken(user) { return jwt.sign({ id:user.id, email:user.email, role:user.role }, secret(), { expiresIn:'8h' }) }
export function requireAuth(req,res,next) { try { const header=req.headers.authorization; if (!header?.startsWith('Bearer ')) return res.status(401).json({ error:'Authentication required' }); req.user=jwt.verify(header.slice(7),secret()); next() } catch { return res.status(401).json({ error:'Invalid or expired token' }) } }
