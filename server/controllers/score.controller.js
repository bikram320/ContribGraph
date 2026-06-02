import dotenv from 'dotenv'
dotenv.config()

import Developer from '../models/Developer.js'
import ScoringEngine from '../services/ScoringEngine.js'

// ─────────────────────────────────────────────────────
// GET /api/scores/:username
// public — anyone can see a developer's current score
// ─────────────────────────────────────────────────────
export const getScore = async (req, res) => {
    try {
        const { username } = req.params

        const developer = await Developer.findOne({
            githubUsername: username
        }).select('githubUsername score availability skills lastSyncAt')

        if (!developer) {
            return res.status(404).json({ message: 'Developer not found.' })
        }

        res.status(200).json({
            username: developer.githubUsername,
            score: developer.score,
            availability: developer.availability,
            skillCount: developer.skills.length,
            lastSyncAt: developer.lastSyncAt
        })

    } catch (error) {
        console.error('getScore error:', error.message)
        res.status(500).json({ message: 'Failed to fetch score.' })
    }
}

// ─────────────────────────────────────────────────────
// GET /api/scores/:username/breakdown
// public — full score breakdown by event type
// powers the breakdown chart on the profile page
// ─────────────────────────────────────────────────────
export const getBreakdown = async (req, res) => {
    try {
        const { username } = req.params

        const developer = await Developer.findOne({ githubUsername: username })

        if (!developer) {
            return res.status(404).json({ message: 'Developer not found.' })
        }

        const breakdown = await ScoringEngine.getBreakdown(developer._id)

        if (!breakdown) {
            return res.status(200).json({
                message: 'No score computed yet. Sync GitHub to generate a score.',
                breakdown: null
            })
        }

        res.status(200).json({ breakdown })

    } catch (error) {
        console.error('getBreakdown error:', error.message)
        res.status(500).json({ message: 'Failed to fetch breakdown.' })
    }
}

// ─────────────────────────────────────────────────────
// GET /api/scores/:username/history
// protected — developer can see their own score history
// returns last 10 snapshots for the trend chart
// ─────────────────────────────────────────────────────
export const getScoreHistory = async (req, res) => {
    try {
        const { username } = req.params

        const developer = await Developer.findOne({ githubUsername: username })

        if (!developer) {
            return res.status(404).json({ message: 'Developer not found.' })
        }

        // only the developer themselves or admin can see history
        const isOwner = developer.userId.toString() === req.user._id.toString()
        const isAdmin = req.user.role === 'admin'

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Access denied.' })
        }

        const history = await ScoringEngine.getScoreHistory(developer._id, 10)

        res.status(200).json({ history })

    } catch (error) {
        console.error('getScoreHistory error:', error.message)
        res.status(500).json({ message: 'Failed to fetch score history.' })
    }
}

// ─────────────────────────────────────────────────────
// POST /api/scores/:username/recompute
// protected — admin only
// force recompute score for any developer
// ─────────────────────────────────────────────────────
export const recomputeScore = async (req, res) => {
    try {
        const { username } = req.params

        const developer = await Developer.findOne({ githubUsername: username })

        if (!developer) {
            return res.status(404).json({ message: 'Developer not found.' })
        }

        const result = await ScoringEngine.computeScore(developer._id)

        res.status(200).json({
            message: 'Score recomputed successfully.',
            score: result.score,
            breakdown: result.breakdown,
            totalEvents: result.totalEvents
        })

    } catch (error) {
        console.error('recomputeScore error:', error.message)
        res.status(500).json({ message: 'Failed to recompute score.' })
    }
}