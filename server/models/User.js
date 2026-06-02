import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    githubId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    avatarUrl: {
        type: String
    },
    role: {
        type: String,
        enum: ['developer', 'recruiter', 'admin'],
        default: 'developer'
    },
    savedDevelopers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Developer'
    }]
}, { timestamps: true })

export default mongoose.model('User', userSchema)