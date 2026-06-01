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

import IngestionService from './services/IngestionService.js'
import ScoringEngine from './services/ScoringEngine.js'
import auth from './middleware/auth.js'
import rbac from './middleware/rbac.js'
import Developer from './models/Developer.js'

// temporary test route — remove after verifying
app.post('/api/test/sync', auth, rbac('developer'), async (req, res) => {
    try {
        const developer = await Developer.findOne({ userId: req.user._id })

        if (!developer) {
            return res.status(404).json({ message: 'Developer profile not found' })
        }

        // NOTE: we need to store accessToken to use here
        // for now test with a hardcoded token from your GitHub settings
        // Settings → Developer settings → Personal access tokens → Generate new token
        // scopes needed: repo, read:user
        const accessToken = process.env.GITHUB_TEST_TOKEN

        const ingestResult = await IngestionService.syncDeveloper(
            developer._id,
            accessToken
        )

        const scoreResult = await ScoringEngine.computeScore(developer._id)

        res.json({
            ingestion: ingestResult,
            scoring: scoreResult
        })

    } catch (error) {
        console.error('Test sync error:', error.message)
        res.status(500).json({ message: error.message })
    }
})