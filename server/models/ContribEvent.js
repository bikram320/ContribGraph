import mongoose from 'mongoose'

const contribEventSchema = new mongoose.Schema({
    githubEventId: {
        type: String,
        required: true,
        unique: true  // prevents duplicate ingestion
    },
    devId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Developer',
        required: true
    },
    type: {
        type: String,
        enum: ['pr_merged', 'review', 'issue_closed', 'push', 'comment'],
        required: true
    },
    repoName: {
        type: String,
        required: true
    },
    repoTopics: {
        type: [String],
        default: []
    },
    repoLanguage: {
        type: String,
        default: null
    },
    weight: {
        type: Number,
        required: true  // stored at ingest time, not recomputed
    },
    occurredAt: {
        type: Date,
        required: true
    }
}, { timestamps: true })

// index for fast per-developer event queries sorted by date
contribEventSchema.index({ devId: 1, occurredAt: -1 })

export default mongoose.model('ContribEvent', contribEventSchema)