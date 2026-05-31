import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const auth = async (req, res, next) => {
    try {
        // read token from HttpOnly cookie
        const token = req.cookies.token

        if (!token) {
            return res.status(401).json({ message: 'Not authenticated. Please log in.' })
        }

        // verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // fetch fresh user from DB — catches deleted/banned accounts
        const user = await User.findById(decoded.id).select('-__v')

        if (!user) {
            return res.status(401).json({ message: 'User no longer exists.' })
        }

        // attach user to request — available in all downstream middleware + controllers
        req.user = user
        next()

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired. Please log in again.' })
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token.' })
        }
        return res.status(500).json({ message: 'Authentication error.' })
    }
}

export default auth