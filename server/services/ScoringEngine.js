import dotenv from 'dotenv'
dotenv.config()

import ContribEvent from '../models/ContribEvent.js'
import ScoreSnapshot from '../models/ScoreSnapshot.js'
import Developer from '../models/Developer.js'

// ─────────────────────────────────────────────────────
// TIME DECAY CONSTANTS
// λ (lambda) controls how fast old events lose value
// λ = 0.005 → half-life of ~138 days
// meaning an event from 138 days ago is worth 50% of its original weight
// an event from 1 year ago is worth ~16%
// an event from 2 years ago is worth ~0.7% (nearly nothing)
// ─────────────────────────────────────────────────────
const DECAY_LAMBDA = 0.005

// ─────────────────────────────────────────────────────
// calculateDecay
// pure function — takes age in days, returns multiplier 0-1
// e^(-λ × days)
// ─────────────────────────────────────────────────────
const calculateDecay = (ageInDays) => {
    if (ageInDays < 0) return 1  // future events = no decay
    return Math.exp(-DECAY_LAMBDA * ageInDays)
}

// ─────────────────────────────────────────────────────
// computeScore — THE MAIN FUNCTION
// reads all ContribEvents for a developer
// applies weight × decay formula to each
// saves a ScoreSnapshot
// updates the cached score on Developer document
// ─────────────────────────────────────────────────────
const computeScore = async (devId) => {
    const developer = await Developer.findById(devId)
    if (!developer) throw new Error('Developer not found')

    // fetch all events for this developer sorted newest first
    const events = await ContribEvent.find({ devId }).sort({ occurredAt: -1 })

    if (events.length === 0) {
        // no events yet — score stays 0
        return {
            score: 0,
            breakdown: { pr_merged: 0, review: 0, issue_closed: 0, push: 0, comment: 0 },
            totalEvents: 0
        }
    }

    const now = new Date()

    // initialize breakdown tracker
    const breakdown = {
        pr_merged: 0,
        review: 0,
        issue_closed: 0,
        push: 0,
        comment: 0
    }

    let totalScore = 0

    // loop through every event and apply the formula
    events.forEach(event => {
        // how many days ago did this event happen?
        const ageInDays = (now - new Date(event.occurredAt)) / (1000 * 60 * 60 * 24)
        //                 ↑ difference in ms → convert to days

        // apply time decay
        const decayMultiplier = calculateDecay(ageInDays)

        // final points for this event = weight × decay
        const points = event.weight * decayMultiplier

        totalScore += points

        // add to the correct breakdown category
        if (breakdown.hasOwnProperty(event.type)) {
            breakdown[event.type] += points
        }
    })

    // round to 2 decimal places for clean display
    const finalScore = Math.round(totalScore * 100) / 100

    // round each breakdown value too
    Object.keys(breakdown).forEach(key => {
        breakdown[key] = Math.round(breakdown[key] * 100) / 100
    })

    // save snapshot — historical record of this computation
    await ScoreSnapshot.create({
        devId,
        score: finalScore,
        breakdown,
        totalEvents: events.length,
        computedAt: now
    })

    // update the cached score on the Developer document
    // this is what shows on the public profile without querying snapshots
    await Developer.findByIdAndUpdate(devId, {
        score: finalScore
    })

    console.log(`Score computed for ${developer.githubUsername}: ${finalScore}`)

    return {
        score: finalScore,
        breakdown,
        totalEvents: events.length
    }
}

// ─────────────────────────────────────────────────────
// getScoreHistory
// returns the last N snapshots for a developer
// used to show the score trend chart on the profile page
// ─────────────────────────────────────────────────────
const getScoreHistory = async (devId, limit = 10) => {
    return await ScoreSnapshot.find({ devId })
        .sort({ computedAt: -1 })
        .limit(limit)
        .select('score breakdown totalEvents computedAt')
}

// ─────────────────────────────────────────────────────
// getBreakdown
// returns the latest snapshot breakdown for a developer
// used for the score breakdown chart on the profile page
// ─────────────────────────────────────────────────────
const getBreakdown = async (devId) => {
    const latest = await ScoreSnapshot.findOne({ devId })
        .sort({ computedAt: -1 })

    if (!latest) return null

    return {
        score: latest.score,
        breakdown: latest.breakdown,
        totalEvents: latest.totalEvents,
        computedAt: latest.computedAt
    }
}

export default {
    computeScore,
    getScoreHistory,
    getBreakdown,
    calculateDecay  // exported for testing
}