import mongoose from 'mongoose'

const snapshotSchema = new mongoose.Schema({
    devId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Developer',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    breakdown: {
        pr_merged:    { type: Number, default: 0 },
        review:       { type: Number, default: 0 },
        issue_closed: { type: Number, default: 0 },
        push:         { type: Number, default: 0 },
        comment:      { type: Number, default: 0 }
    },
    totalEvents: {
        type: Number,
        default: 0
    },
    computedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: false })

// keep only last 30 snapshots per developer — old ones auto-delete
snapshotSchema.index(
    { computedAt: 1 },
    { expireAfterSeconds: 60 * 60 * 24 * 90 } // 90 days TTL
)

snapshotSchema.index({ devId: 1, computedAt: -1 })

export default mongoose.model('ScoreSnapshot', snapshotSchema)