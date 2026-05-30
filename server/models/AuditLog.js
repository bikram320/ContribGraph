import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema({
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null  // null for unauthenticated requests
    },
    method: {
        type: String,
        required: true  // GET, POST, PATCH, DELETE
    },
    route: {
        type: String,
        required: true
    },
    ip: {
        type: String
    },
    statusCode: {
        type: Number
    },
    ts: {
        type: Date,
        default: Date.now
    }
}, { timestamps: false })

// auto-delete audit logs after 90 days
auditLogSchema.index(
    { ts: 1 },
    { expireAfterSeconds: 60 * 60 * 24 * 90 }
)

export default mongoose.model('AuditLog', auditLogSchema)