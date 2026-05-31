// rbac = Role Based Access Control
// This is a middleware factory — it returns a middleware function
// Usage in routes:
//   rbac('developer')              → only developers
//   rbac('recruiter')              → only recruiters
//   rbac('developer', 'recruiter') → both allowed
//   rbac('admin')                  → only admin

const rbac = (...allowedRoles) => {
    return (req, res, next) => {

        // rbac always runs AFTER auth middleware
        // so req.user should already be attached
        if (!req.user) {
            return res.status(401).json({
                message: 'Not authenticated.'
            })
        }

        // check if logged in user's role is in the allowed list
        const hasPermission = allowedRoles.includes(req.user.role)

        if (!hasPermission) {
            return res.status(403).json({
                message: `Access denied. Allowed roles: ${allowedRoles.join(', ')}.`
            })
        }

        // role is valid — continue to controller
        next()
    }
}

export default rbac