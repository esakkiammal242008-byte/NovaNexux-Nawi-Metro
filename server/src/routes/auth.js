import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db, { audit } from '../database/db.js'
import { signToken } from '../middleware/auth.js'
const router=Router()
router.post('/login', (req,res)=>{ try { const {email,password}=req.body||{}; if(!email||!password)return res.status(400).json({error:'Email and password are required'}); const user=db.prepare('SELECT * FROM users WHERE email=?').get(email.toLowerCase()); if(!user||!bcrypt.compareSync(password,user.password_hash))return res.status(401).json({error:'Invalid credentials'}); audit(user.id,'login','user:'+user.id,'Successful login'); res.json({token:signToken(user),user:{id:user.id,email:user.email,role:user.role}}) } catch(e){res.status(500).json({error:e.message})} })
export default router
