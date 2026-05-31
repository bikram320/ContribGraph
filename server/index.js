import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './config/db.js'
import { generalLimiter } from './middleware/rateLimiter.js'
import auditLogger from './middleware/auditLogger.js'

// import models so mongoose registers them on startup
import './models/User.js'
import './models/Developer.js'
import './models/ContribEvent.js'
import './models/ScoreSnapshot.js'
import './models/AuditLog.js'

dotenv.config()
connectDB()

const app = express()

// ── global middleware ──────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true       // required for HttpOnly cookies
}))
app.use(express.json())
app.use(cookieParser())
app.use(generalLimiter)   // rate limit all routes
app.use(auditLogger)      // log all mutating requests

// ── routes (empty for now — we'll add these next) ─────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ContribGraph API running' })
})

// ── global error handler ──────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))