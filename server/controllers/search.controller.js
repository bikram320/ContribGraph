import dotenv from 'dotenv'
dotenv.config()

import Developer from '../models/Developer.js'
import User from '../models/User.js'

// ─────────────────────────────────────────────────────
// GET /api/search/developers
// protected — recruiter only
// searches developers by skills + score range
// uses the compound index on { skills.tag, score }
// ─────────────────────────────────────────────────────
export const searchDevelopers = async (req, res) => {
    try {
        const {
            skills,       // comma-separated: "react,nodejs,mongodb"
            minScore,     // minimum score threshold
            maxScore,     // maximum score threshold
            availability, // 'open' | 'busy' | 'closed'
            page = 1,
            limit = 10
        } = req.query

        // build the MongoDB query dynamically
        const query = {}

        // skills filter — match developers who have ANY of the requested skills
        if (skills) {
            const skillArray = skills.split(',').map(s => s.trim().toLowerCase())
            query['skills.tag'] = { $in: skillArray }
            // ↑ $in = "skills.tag must be one of these values"
            //   a developer with [react, nodejs] matches a search for "react"
        }

        // score range filter
        if (minScore || maxScore) {
            query.score = {}
            if (minScore) query.score.$gte = parseFloat(minScore)
            if (maxScore) query.score.$lte = parseFloat(maxScore)
            // ↑ $gte = greater than or equal
            //   $lte = less than or equal
        }

        // availability filter
        if (availability) {
            query.availability = availability
        }

        const skip = (parseInt(page) - 1) * parseInt(limit)

        // run search + count in parallel
        const [developers, total] = await Promise.all([
            Developer.find(query)
                .populate('userId', 'username avatarUrl')
                .sort({ score: -1 })
                // ↑ highest score first — uses the compound index
                .skip(skip)
                .limit(parseInt(limit))
                .select('githubUsername skills score availability lastSyncAt'),
            Developer.countDocuments(query)
        ])

        res.status(200).json({
            developers,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            },
            filters: { skills, minScore, maxScore, availability }
        })

    } catch (error) {
        console.error('searchDevelopers error:', error.message)
        res.status(500).json({ message: 'Search failed.' })
    }
}

// ─────────────────────────────────────────────────────
// POST /api/search/saved
// protected — recruiter only
// save a developer to recruiter's shortlist
// stored directly on the User document as an array
// ─────────────────────────────────────────────────────
export const saveDeveloper = async (req, res) => {
    try {
        const { developerId } = req.body

        if (!developerId) {
            return res.status(400).json({ message: 'developerId is required.' })
        }

        // verify the developer exists
        const developer = await Developer.findById(developerId)
        if (!developer) {
            return res.status(404).json({ message: 'Developer not found.' })
        }

        // add to saved list — $addToSet prevents duplicates automatically
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { savedDevelopers: developerId }
            // ↑ $addToSet = add to array only if not already present
            //   unlike $push which would add duplicates
        })

        res.status(200).json({ message: 'Developer saved to shortlist.' })

    } catch (error) {
        console.error('saveDeveloper error:', error.message)
        res.status(500).json({ message: 'Failed to save developer.' })
    }
}

// ─────────────────────────────────────────────────────
// GET /api/search/saved
// protected — recruiter only
// returns the recruiter's saved developer shortlist
// ─────────────────────────────────────────────────────
export const getSavedDevelopers = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'savedDevelopers',
                // ↑ populate replaces ObjectIds with actual Developer documents
                select: 'githubUsername skills score availability lastSyncAt',
                populate: {
                    path: 'userId',
                    select: 'username avatarUrl'
                    // nested populate — also fetch User info inside each Developer
                }
            })

        res.status(200).json({
            saved: user.savedDevelopers || [],
            total: user.savedDevelopers?.length || 0
        })

    } catch (error) {
        console.error('getSavedDevelopers error:', error.message)
        res.status(500).json({ message: 'Failed to fetch saved developers.' })
    }
}

// ─────────────────────────────────────────────────────
// DELETE /api/search/saved/:developerId
// protected — recruiter only
// remove a developer from shortlist
// ─────────────────────────────────────────────────────
export const removeSavedDeveloper = async (req, res) => {
    try {
        const { developerId } = req.params

        await User.findByIdAndUpdate(req.user._id, {
            $pull: { savedDevelopers: developerId }
            // ↑ $pull = remove this value from the array
        })

        res.status(200).json({ message: 'Developer removed from shortlist.' })

    } catch (error) {
        console.error('removeSavedDeveloper error:', error.message)
        res.status(500).json({ message: 'Failed to remove developer.' })
    }
}
// ─────────────────────────────────────────────────────
// GET /api/search/leaderboard
// PUBLIC — no auth required
// returns top developers sorted by score
// ─────────────────────────────────────────────────────
export const getLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20

        const developers = await Developer.find({ score: { $gt: 0 } })
            .populate('userId', 'username avatarUrl')
            .sort({ score: -1 })
            .limit(limit)
            .select('githubUsername skills score availability lastSyncAt userId')

        res.status(200).json({ developers, total: developers.length })
    } catch (error) {
        console.error('getLeaderboard error:', error.message)
        res.status(500).json({ message: 'Failed to fetch leaderboard.' })
    }
}