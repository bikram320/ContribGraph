import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const auth = async (req, res, next) => {
    try {
        // Try cookie first, then Authorization header
        let token = req.cookies.token

        if (!token) {
            const authHeader = req.headers.authorization
            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1]
            }
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authenticated. Please log in.' })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('-__v')

        if (!user) {
            return res.status(401).json({ message: 'User no longer exists.' })
        }

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