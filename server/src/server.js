import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import db from './database/db.js'
import { requireAuth } from './middleware/auth.js'
import auth from './routes/auth.js'
import instruments from './routes/instruments.js'
import tests from './routes/tests.js'
import reports from './routes/reports.js'
import alerts from './routes/alerts.js'
import sensors from './routes/sensors.js'
import audit from './routes/audit.js'

const app = express()
const PORT = process.env.PORT || 4000
const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5173']

app.use(cors({ origin(origin, callback) { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); return callback(new Error('Origin not allowed by CORS')) }, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'NovaNexus API', version: '1.0.0' }))
app.use('/api/auth', auth)
app.use('/api/instruments', requireAuth, instruments)
app.use('/api/tests', requireAuth, tests)
app.use('/api/reports', requireAuth, reports)
app.use('/api/alerts', requireAuth, alerts)
app.use('/api/sensors', requireAuth, sensors)
app.use('/api/audit', requireAuth, audit)
app.use((error, req, res, next) => { console.error(error); res.status(500).json({ error: 'Internal server error' }) })
app.use((req, res) => res.status(404).json({ error: 'Route not found' }))
app.listen(PORT, '0.0.0.0', () => console.log(`NovaNexus API listening on port ${PORT}`))
