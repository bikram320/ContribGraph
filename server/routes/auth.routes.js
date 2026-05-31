import express from 'express'
import passport from 'passport'
import {
    githubCallback,
    logout,
    getMe,
    switchRole
} from '../controllers/auth.controller.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// ── GitHub OAuth flow ──────────────────────────────────

// Step 1: user clicks "Login with GitHub"
// passport redirects them to github.com/login/oauth/authorize
router.get(
    '/github',
    passport.authenticate('github', { scope: ['user:email', 'read:user', 'repo'] })
)

// Step 2: GitHub redirects back here after user approves
// passport.authenticate verifies the code GitHub sent
// on success → calls githubCallback with req.user attached
// on failure → redirects to login page
router.get(
    '/github/callback',
    passport.authenticate('github', {
        session: false,           // we use JWT not sessions
        failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`
    }),
    githubCallback
)

// ── protected auth routes ──────────────────────────────

// logout — clears the cookie
router.post('/logout', auth, logout)

// get current logged in user + their developer profile
router.get('/me', auth, getMe)

// switch between developer and recruiter role
router.patch('/role', auth, switchRole)

export default router