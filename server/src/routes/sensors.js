import { Router } from 'express'
import { audit } from '../database/db.js'
const router = Router()
router.post('/readings', (req, res) => { try { const body = req.body || {}; const reading = { weight: Number.isFinite(Number(body.weight)) ? Number(body.weight) : (300 + Math.random() * 0.2).toFixed(2), temperature: Number.isFinite(Number(body.temperature)) ? Number(body.temperature) : (23 + Math.random()).toFixed(1), humidity: Number.isFinite(Number(body.humidity)) ? Number(body.humidity) : (44 + Math.random() * 3).toFixed(1), vibration: Number.isFinite(Number(body.vibration)) ? Number(body.vibration) : (Math.random() * 0.12).toFixed(3), simulated: true, source: 'SIMULATED SENSOR DATA', timestamp: new Date().toISOString() }; audit(req.user.id, 'sensor reading', 'sensor-simulator', 'Simulated sensor data generated'); res.status(201).json(reading) } catch (error) { res.status(400).json({ error: error.message }) } })
export default router
