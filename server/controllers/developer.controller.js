import dotenv from 'dotenv'
dotenv.config()

import Developer from '../models/Developer.js'
import ContribEvent from '../models/ContribEvent.js'
import IngestionService from '../services/IngestionService.js'
import ScoringEngine from '../services/ScoringEngine.js'

// ─────────────────────────────────────────────────────
// GET /api/developers/:username
// public route — anyone can view a developer profile
// ─────────────────────────────────────────────────────
export const getPublicProfile = async (req, res) => {
    try {
        const { username } = req.params

        const developer = await Developer.findOne({
            githubUsername: username
        }).populate('userId', 'username email avatarUrl')
        // ↑ populate replaces userId ObjectId with the actual User document
        //   but only fetches username, email, avatarUrl — not the whole document

        if (!developer) {
            return res.status(404).json({ message: 'Developer not found.' })
        }

        res.status(200).json({ developer })

    } catch (error) {
        console.error('getPublicProfile error:', error.message)
        res.status(500).json({ message: 'Failed to fetch profile.' })
    }
}

// ─────────────────────────────────────────────────────
// GET /api/developers/me
// protected — returns the logged-in developer's own profile
// ─────────────────────────────────────────────────────
export const getMyProfile = async (req, res) => {
    try {
        const developer = await Developer.findOne({ userId: req.user._id })

        if (!developer) {
            return res.status(404).json({ message: 'Developer profile not found.' })
        }

        res.status(200).json({ developer })

    } catch (error) {
        console.error('getMyProfile error:', error.message)
        res.status(500).json({ message: 'Failed to fetch profile.' })
    }
}

// ─────────────────────────────────────────────────────
// POST /api/developers/sync
// protected — developer only
// triggers GitHub ingestion + score recomputation
// this is the most complex endpoint in the app
// ─────────────────────────────────────────────────────
export const syncGitHub = async (req, res) => {
    try {
        const developer = await Developer.findOne({ userId: req.user._id })

        if (!developer) {
            return res.status(404).json({ message: 'Developer profile not found.' })
        }

        // get access token from request body
        // frontend sends this after getting it from the OAuth flow
        const { accessToken } = req.body

        if (!accessToken) {
            return res.status(400).json({ message: 'GitHub access token required.' })
        }

        // step 1 — ingest GitHub events + update skills
        const ingestResult = await IngestionService.syncDeveloper(
            developer._id,
            accessToken
        )

        // step 2 — recompute score from all stored events
        const scoreResult = await ScoringEngine.computeScore(developer._id)

        res.status(200).json({
            message: 'GitHub sync complete.',
            ingestion: {
                newEvents: ingestResult.newEventsCount,
                totalRepos: ingestResult.totalRepos,
                skillsFound: ingestResult.skillsFound
            },
            score: scoreResult.score,
            breakdown: scoreResult.breakdown,
            totalEvents: scoreResult.totalEvents
        })

    } catch (error) {
        console.error('syncGitHub error:', error.message)
        res.status(500).json({ message: 'Sync failed. Please try again.' })
    }
}

// ─────────────────────────────────────────────────────
// PATCH /api/developers/availability
// protected — developer only
// update open to work status
// ─────────────────────────────────────────────────────
export const updateAvailability = async (req, res) => {
    try {
        const { availability } = req.body

        const allowed = ['open', 'busy', 'closed']
        if (!allowed.includes(availability)) {
            return res.status(400).json({
                message: `Invalid availability. Must be one of: ${allowed.join(', ')}`
            })
        }

        const developer = await Developer.findOneAndUpdate(
            { userId: req.user._id },
            { availability },
            { new: true }  // return updated document
        )

        if (!developer) {
            return res.status(404).json({ message: 'Developer profile not found.' })
        }

        res.status(200).json({
            message: `Availability updated to "${availability}".`,
            availability: developer.availability
        })

    } catch (error) {
        console.error('updateAvailability error:', error.message)
        res.status(500).json({ message: 'Failed to update availability.' })
    }
}

// ─────────────────────────────────────────────────────
// GET /api/developers/:username/events
// protected — developer can see their own events
// returns paginated list of ContribEvents
// ─────────────────────────────────────────────────────
export const getMyEvents = async (req, res) => {
    try {
        const developer = await Developer.findOne({ userId: req.user._id })

        if (!developer) {
            return res.status(404).json({ message: 'Developer profile not found.' })
        }

        // pagination — default page 1, 20 per page
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 20
        const skip = (page - 1) * limit

        const [events, total] = await Promise.all([
            ContribEvent.find({ devId: developer._id })
                .sort({ occurredAt: -1 })  // newest first
                .skip(skip)
                .limit(limit),
            ContribEvent.countDocuments({ devId: developer._id })
        ])
        // ↑ Promise.all runs both queries simultaneously
        //   instead of waiting for each one sequentially

        res.status(200).json({
            events,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        })

    } catch (error) {
        console.error('getMyEvents error:', error.message)
        res.status(500).json({ message: 'Failed to fetch events.' })
    }
}