import rateLimit from 'express-rate-limit'

// general limiter — all API routes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many requests. Please try again in 15 minutes.'
    }
})

// strict limiter — GitHub sync endpoint only
// GitHub API has rate limits, so we protect our sync route hard
export const syncLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,                    // only 5 syncs per hour per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Sync limit reached. You can sync up to 5 times per hour.'
    }
})