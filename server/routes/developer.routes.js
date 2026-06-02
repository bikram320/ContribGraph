import express from 'express'
import {
    getPublicProfile,
    getMyProfile,
    syncGitHub,
    updateAvailability,
    getMyEvents
} from '../controllers/developer.controller.js'
import auth from '../middleware/auth.js'
import rbac from '../middleware/rbac.js'
import { syncLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// ── public routes ──────────────────────────────────────
// no auth needed — anyone can view a public profile
router.get('/profile/:username', getPublicProfile)

// ── protected routes — developer only ─────────────────
router.get('/me', auth, rbac('developer'), getMyProfile)

router.get('/me/events', auth, rbac('developer'), getMyEvents)

router.patch('/availability', auth, rbac('developer'), updateAvailability)

// sync route has extra rate limiting on top of auth + rbac
router.post('/sync', auth, rbac('developer'), syncLimiter, syncGitHub)

export default router