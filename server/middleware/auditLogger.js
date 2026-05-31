import AuditLog from '../models/AuditLog.js'

const auditLogger = async (req, res, next) => {
    // only log mutating requests — skip GET and OPTIONS
    const mutatingMethods = ['POST', 'PATCH', 'PUT', 'DELETE']
    if (!mutatingMethods.includes(req.method)) {
        return next()
    }

    // hook into res.finish to capture status code after response is sent
    const originalSend = res.send.bind(res)

    res.send = function (body) {
        // write log async — don't block the response
        AuditLog.create({
            actor: req.user?._id || null,
            method: req.method,
            route: req.originalUrl,
            ip: req.ip || req.headers['x-forwarded-for'],
            statusCode: res.statusCode
        }).catch(err => console.error('AuditLog write failed:', err))

        return originalSend(body)
    }

    next()
}

export default auditLogger