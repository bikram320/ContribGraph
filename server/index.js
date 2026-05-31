import dotenv from 'dotenv'
dotenv.config()   // ← must be FIRST before any other imports

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import connectDB from './config/db.js'
import './config/passport.js'
import { generalLimiter } from './middleware/rateLimiter.js'
import auditLogger from './middleware/auditLogger.js'
import authRoutes from './routes/auth.routes.js'

import './models/User.js'
import './models/Developer.js'
import './models/ContribEvent.js'
import './models/ScoreSnapshot.js'
import './models/AuditLog.js'

connectDB()

const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())
app.use(generalLimiter)
app.use(auditLogger)

app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ContribGraph API running' })
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))