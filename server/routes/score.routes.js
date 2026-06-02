import express from 'express'
import {
    getScore,
    getBreakdown,
    getScoreHistory,
    recomputeScore
} from '../controllers/score.controller.js'
import auth from '../middleware/auth.js'
import rbac from '../middleware/rbac.js'

const router = express.Router()

// ── public routes ──────────────────────────────────────
router.get('/:username', getScore)
router.get('/:username/breakdown', getBreakdown)

// ── protected routes ───────────────────────────────────
router.get('/:username/history', auth, getScoreHistory)

// admin only — force recompute any developer's score
router.post('/:username/recompute', auth, rbac('admin'), recomputeScore)

export default router