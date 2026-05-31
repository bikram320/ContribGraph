import dotenv from 'dotenv'
dotenv.config()   // ← add this here too

import passport from 'passport'
import { Strategy as GitHubStrategy } from 'passport-github2'
import User from '../models/User.js'
import Developer from '../models/Developer.js'

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL,
            scope: ['user:email', 'read:user', 'repo']
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ githubId: profile.id })

                if (user) {
                    return done(null, user)
                }

                user = await User.create({
                    githubId: profile.id,
                    username: profile.username,
                    email: profile.emails?.[0]?.value || null,
                    avatarUrl: profile.photos?.[0]?.value || null,
                    role: 'developer'
                })

                await Developer.create({
                    userId: user._id,
                    githubUsername: profile.username,
                    bio: profile._json.bio || null,
                    location: profile._json.location || null,
                    skills: [],
                    score: 0,
                    availability: 'open'
                })

                return done(null, user)

            } catch (error) {
                return done(error, null)
            }
        }
    )
)

passport.serializeUser((user, done) => done(null, user._id))
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (err) {
        done(err, null)
    }
})

export default passport