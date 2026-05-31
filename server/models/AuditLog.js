import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema({
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    method: {
        type: String,
        required: true
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

auditLogSchema.index(
    { ts: 1 },
    { expireAfterSeconds: 60 * 60 * 24 * 90 }
)

export default mongoose.model('AuditLog', auditLogSchema)