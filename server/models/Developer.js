import mongoose from 'mongoose'

const skillSchema = new mongoose.Schema({
    tag: { type: String, required: true },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate'
    },
    inferredFrom: [String]
}, { _id: false })

const developerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    githubUsername: {
        type: String,
        required: true,
        unique: true
    },
    bio: String,
    location: String,
    skills: [skillSchema],
    score: {
        type: Number,
        default: 0
    },
    availability: {
        type: String,
        enum: ['open', 'busy', 'closed'],
        default: 'open'
    },
    lastSyncAt: {
        type: Date,
        default: null
    }
}, { timestamps: true })


developerSchema.index({ 'skills.tag': 1, score: -1 })

export default mongoose.model('Developer', developerSchema)