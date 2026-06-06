import dotenv from 'dotenv'
dotenv.config() // MUST be first

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import passport from 'passport'

import connectDB from './config/db.js'
import './config/passport.js'

import { generalLimiter, authLimiter } from './middleware/rateLimiter.js'
import auditLogger from './middleware/auditLogger.js'
import auth from './middleware/auth.js'
import rbac from './middleware/rbac.js'

// Routes
import authRoutes from './routes/auth.routes.js'
import developerRoutes from './routes/developer.routes.js'
import scoreRoutes from './routes/score.routes.js'
import searchRoutes from './routes/search.routes.js'

// Services
import IngestionService from './services/IngestionService.js'
import ScoringEngine from './services/ScoringEngine.js'

// Models
import User from './models/User.js'
import Developer from './models/Developer.js'
import './models/ContribEvent.js'
import './models/ScoreSnapshot.js'
import './models/AuditLog.js'

// Database
connectDB()

const app = express()

// =====================================================
// Core Middleware
// =====================================================

app.use(cors({
    origin: process.env.CLIENT_URL,   // https://contrib-graph.vercel.app
    credentials: true,                // ← this must be true for cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

// also add this — handles preflight OPTIONS requests
app.options('/{*path}', cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())
app.use(auditLogger)

// =====================================================
// API Routes
// =====================================================

// Auth routes use their own looser limiter — must be registered
// BEFORE generalLimiter so the general one doesn't fire first
app.use('/api/auth', authLimiter, authRoutes)

// Everything else gets the general limiter
app.use(generalLimiter)
app.use('/api/developers', developerRoutes)
app.use('/api/scores', scoreRoutes)
app.use('/api/search', searchRoutes)

// =====================================================
// Health Check
// =====================================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'ContribGraph API running'
    })
})

// =====================================================
// TEMP TEST SYNC ROUTE
// Remove after OAuth token storage is implemented
// =====================================================

app.post('/api/test/sync', auth, rbac('developer'), async (req, res) => {
    try {
        const developer = await Developer.findOne({
            userId: req.user._id
        })

        if (!developer) {
            return res.status(404).json({
                message: 'Developer profile not found'
            })
        }

        const accessToken = process.env.GITHUB_TEST_TOKEN

        if (!accessToken) {
            return res.status(500).json({
                message: 'GITHUB_TEST_TOKEN not configured'
            })
        }

        const ingestionResult = await IngestionService.syncDeveloper(
            developer._id,
            accessToken
        )

        const scoringResult = await ScoringEngine.computeScore(
            developer._id
        )

        res.json({
            success: true,
            ingestion: ingestionResult,
            scoring: scoringResult
        })
    } catch (error) {
        console.error('Test sync error:', error)

        res.status(500).json({
            message: error.message || 'Sync failed'
        })
    }
})

// =====================================================
// Global Error Handler
// =====================================================

app.use((err, req, res, next) => {
    console.error(err.stack)

    res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    })
})

// =====================================================
// Server Start
// =====================================================

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
})