import rateLimit from 'express-rate-limit'

// general limiter — all API routes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 100 : 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many requests. Please try again in 15 minutes.'
    }
})

// auth limiter — GitHub OAuth routes only
// loose enough to not block normal login flows
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,   // 30 auth attempts per 15 min per IP is plenty
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many login attempts. Please try again in 15 minutes.'
    }
})

// strict limiter — GitHub sync endpoint only
export const syncLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Sync limit reached. You can sync up to 5 times per hour.'
    }
})