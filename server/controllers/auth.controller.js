import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Developer from '../models/Developer.js'

// helper — generates JWT and sets it as HttpOnly cookie
const sendTokenCookie = (res, user) => {
    const token = jwt.sign(
        { id: user._id },                  // payload — keep it minimal
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.cookie('token', token, {
        httpOnly: true,    // JS in browser cannot read this cookie — XSS protection
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax',   // protects against CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in milliseconds
    })

    return token
}

// ─────────────────────────────────────────────
// GET /api/auth/github
// redirects user to GitHub login page
// passport handles this automatically — no logic needed here
// ─────────────────────────────────────────────
export const githubLogin = (req, res) => {
    // passport middleware handles the redirect
    // this controller is just a placeholder
    res.status(200).json({ message: 'Redirecting to GitHub...' })
}

// ─────────────────────────────────────────────
// GET /api/auth/github/callback
// GitHub redirects here after user approves
// passport verifies and gives us req.user
// ─────────────────────────────────────────────
export const githubCallback = async (req, res) => {
    try {
        // req.user is set by passport after successful OAuth
        const user = req.user

        if (!user) {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`)
        }

        // generate JWT and set cookie
        sendTokenCookie(res, user)

        // redirect to frontend dashboard
        res.redirect(`${process.env.CLIENT_URL}/dashboard`)

    } catch (error) {
        console.error('GitHub callback error:', error)
        res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`)
    }
}

// ─────────────────────────────────────────────
// POST /api/auth/logout
// clears the JWT cookie
// ─────────────────────────────────────────────
export const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    })

    res.status(200).json({ message: 'Logged out successfully.' })
}

// ─────────────────────────────────────────────
// GET /api/auth/me
// returns the currently logged in user
// protected by auth middleware
// ─────────────────────────────────────────────
export const getMe = async (req, res) => {
    try {
        // req.user already attached by auth middleware
        const user = req.user

        // also fetch their developer profile if they have one
        const developer = await Developer.findOne({ userId: user._id })

        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
                role: user.role
            },
            developer: developer || null
        })

    } catch (error) {
        console.error('getMe error:', error)
        res.status(500).json({ message: 'Failed to fetch user.' })
    }
}

// ─────────────────────────────────────────────
// PATCH /api/auth/role
// lets a user switch to recruiter role
// a developer who wants to recruit can switch once
// ─────────────────────────────────────────────
export const switchRole = async (req, res) => {
    try {
        const { role } = req.body

        // only allow switching between developer and recruiter
        const allowedRoles = ['developer', 'recruiter']
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role.' })
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { role },
            { new: true }  // return the updated document
        )

        res.status(200).json({
            message: `Role updated to ${role}.`,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        })

    } catch (error) {
        console.error('switchRole error:', error)
        res.status(500).json({ message: 'Failed to update role.' })
    }
}