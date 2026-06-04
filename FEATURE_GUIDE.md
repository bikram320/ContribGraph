# 🚀 Quick Start - Add New Features

## Feature 1: Notifications System

### Backend Setup

**1. Create Notification Model**
```javascript
// server/models/Notification.js
import { Schema, model } from 'mongoose'

const NotificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['profile_view', 'saved', 'message'], required: true },
    message: String,
    relatedDeveloperId: { type: Schema.Types.ObjectId, ref: 'Developer' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
})

NotificationSchema.index({ userId: 1, isRead: 1 })
export default model('Notification', NotificationSchema)
```

**2. Create Notification Controller**
```javascript
// server/controllers/notification.controller.js
import Notification from '../models/Notification.js'

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20)
        
        res.status(200).json({ notifications })
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch notifications.' })
    }
}

export const markAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true }
        )
        
        res.status(200).json({ message: 'Notifications marked as read.' })
    } catch (error) {
        res.status(500).json({ message: 'Failed to update notifications.' })
    }
}
```

**3. Create Routes**
```javascript
// server/routes/notification.routes.js
import express from 'express'
import { getNotifications, markAsRead } from '../controllers/notification.controller.js'
import auth from '../middleware/auth.js'

const router = express.Router()

router.get('/', auth, getNotifications)
router.patch('/read', auth, markAsRead)

export default router
```

### Frontend Setup

**1. Create API Methods**
```javascript
// client/src/api/notification.api.js
import api from './axios.js'

export const getNotifications = () => api.get('/notifications')
export const markAsRead = () => api.patch('/notifications/read')
```

**2. Create Store**
```javascript
// client/src/store/notificationStore.js
import { create } from 'zustand'

const useNotificationStore = create((set) => ({
    notifications: [],
    unreadCount: 0,

    setNotifications: (notifications) => set({
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length
    }),

    markAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
    })) 
}))

export default useNotificationStore
```

**3. Create Notification Bell Component**
```jsx
// client/src/components/NotificationBell.jsx
import { useEffect, useState } from 'react'
import useNotificationStore from '../store/notificationStore.js'
import { getNotifications } from '../api/notification.api.js'

const NotificationBell = () => {
    const { notifications, unreadCount, setNotifications } = useNotificationStore()
    const [showPanel, setShowPanel] = useState(false)

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getNotifications()
                setNotifications(res.data.notifications)
            } catch (err) {
                console.error(err)
            }
        }
        fetch()
        
        // Poll every 30 seconds
        const interval = setInterval(fetch, 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setShowPanel(!showPanel)}
                style={{
                    position: 'relative',
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-elevated)',
                    cursor: 'pointer',
                    fontSize: 16
                }}
            >
                🔔
                {unreadCount > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: 'var(--red)',
                        color: 'white',
                        fontSize: 11,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {unreadCount}
                    </div>
                )}
            </button>

            {showPanel && (
                <div style={{
                    position: 'absolute',
                    top: 40,
                    right: 0,
                    width: 320,
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    zIndex: 1000,
                    maxHeight: 400,
                    overflow: 'auto'
                }}>
                    {notifications.length > 0 ? (
                        notifications.map(notif => (
                            <div key={notif._id} style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid var(--border)',
                                opacity: notif.isRead ? 0.6 : 1
                            }}>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                    {notif.message}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div style={{
                            padding: '20px',
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            fontSize: 12
                        }}>
                            No notifications
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default NotificationBell
```

---

## Feature 2: Developer Badges/Achievements

### Backend Setup

**1. Create Badge Model**
```javascript
// server/models/Badge.js
import { Schema, model } from 'mongoose'

const BadgeSchema = new Schema({
    developerId: { type: Schema.Types.ObjectId, ref: 'Developer', required: true },
    badgeType: {
        type: String,
        enum: ['100_score', '500_pr', 'skill_expert', 'topcontributor'],
        required: true
    },
    name: String,
    description: String,
    icon: String,  // emoji or URL
    earnedAt: { type: Date, default: Date.now }
})

export default model('Badge', BadgeSchema)
```

**2. Badge Controller**
```javascript
// server/controllers/badge.controller.js
import Badge from '../models/Badge.js'
import Developer from '../models/Developer.js'

export const checkAndAwardBadges = async (developerId) => {
    const developer = await Developer.findById(developerId)
    
    const badges = []

    // Check score milestone
    if (developer.score >= 100 && !await Badge.findOne({ developerId, badgeType: '100_score' })) {
        badges.push(await Badge.create({
            developerId,
            badgeType: '100_score',
            name: '🎯 Century Club',
            description: 'Score 100+ points',
            icon: '🎯'
        }))
    }

    // Check PR count
    if (developer.totalPRs >= 500) {
        badges.push(await Badge.create({
            developerId,
            badgeType: '500_pr',
            name: '📈 PR Legend',
            description: 'Merged 500+ pull requests',
            icon: '📈'
        }))
    }

    return badges
}

export const getBadges = async (req, res) => {
    try {
        const { username } = req.params
        const developer = await Developer.findOne({ githubUsername: username })
        
        const badges = await Badge.find({ developerId: developer._id })
        
        res.status(200).json({ badges })
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch badges.' })
    }
}
```

**3. Add to Profile Component**
```jsx
// In Profile.jsx, after skills section:
{developer.badges && developer.badges.length > 0 && (
    <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '20px 24px',
        marginBottom: 24
    }}>
        <p style={{ 
            fontSize: 11, 
            fontWeight: 500, 
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: 'var(--text-muted)',
            marginBottom: 14 
        }}>
            Badges & Achievements
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {developer.badges.map(badge => (
                <div key={badge._id} style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    backgroundColor: 'var(--accent-dim)',
                    border: '1px solid var(--accent)',
                    textAlign: 'center'
                }} title={badge.description}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{badge.icon}</div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-text)' }}>
                        {badge.name}
                    </p>
                </div>
            ))}
        </div>
    </div>
)}
```

---

## Feature 3: Developer Activity Timeline

### Backend Endpoint
```javascript
// server/controllers/developer.controller.js
export const getActivityTimeline = async (req, res) => {
    try {
        const developer = await Developer.findOne({ userId: req.user._id })
        
        const events = await ContribEvent.find({ devId: developer._id })
            .sort({ occurredAt: -1 })
            .limit(100)
        
        // Group by date for timeline
        const timeline = {}
        events.forEach(event => {
            const date = new Date(event.occurredAt).toLocaleDateString()
            if (!timeline[date]) timeline[date] = []
            timeline[date].push(event)
        })
        
        res.status(200).json({ timeline })
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch timeline.' })
    }
}
```

### Frontend Component
```jsx
// client/src/components/ActivityTimeline.jsx
const ActivityTimeline = ({ events = [] }) => {
    const groupedEvents = events.reduce((acc, event) => {
        const date = new Date(event.occurredAt).toLocaleDateString()
        if (!acc[date]) acc[date] = []
        acc[date].push(event)
        return acc
    }, {})

    return (
        <div style={{ padding: '20px' }}>
            {Object.entries(groupedEvents).map(([date, dayEvents]) => (
                <div key={date} style={{ marginBottom: 30 }}>
                    <p style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        marginBottom: 12
                    }}>
                        {date}
                    </p>
                    {dayEvents.map(event => (
                        <div key={event._id} style={{
                            display: 'flex',
                            gap: 12,
                            marginBottom: 12,
                            paddingLeft: 20,
                            borderLeft: '2px solid var(--accent)',
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                left: -7,
                                top: 0,
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: 'var(--accent)'
                            }} />
                            <div>
                                <p style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: 'var(--text-primary)',
                                    marginBottom: 4
                                }}>
                                    {event.eventType === 'PullRequest' ? '🔀 ' : 
                                     event.eventType === 'Review' ? '👀 ' : 
                                     '📝 '}
                                    {event.title}
                                </p>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    in <strong>{event.repo}</strong>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default ActivityTimeline
```

---

## Feature 4: Skills Endorsements

### Backend Model & Controller
```javascript
// server/models/SkillEndorsement.js
import { Schema, model } from 'mongoose'

const EndorsementSchema = new Schema({
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
    endorsedDeveloperId: { type: Schema.Types.ObjectId, ref: 'Developer', required: true },
    endorsedByDeveloperId: { type: Schema.Types.ObjectId, ref: 'Developer', required: true },
    createdAt: { type: Date, default: Date.now }
})

EndorsementSchema.index({ skillId: 1, endorsedDeveloperId: 1 })
export default model('SkillEndorsement', EndorsementSchema)
```

```javascript
// In server/controllers/developer.controller.js
export const endorseSkill = async (req, res) => {
    try {
        const { targetDeveloperId, skillTag } = req.body
        const developerEndorsing = await Developer.findOne({ userId: req.user._id })
        
        await SkillEndorsement.create({
            skillId: skillTag,
            endorsedDeveloperId: targetDeveloperId,
            endorsedByDeveloperId: developerEndorsing._id
        })
        
        res.status(201).json({ message: 'Skill endorsed!' })
    } catch (error) {
        res.status(500).json({ message: 'Failed to endorse skill.' })
    }
}
```

---

## Feature 5: Saved Searches (Recruiter)

### Backend Model
```javascript
// server/models/SavedSearch.js
import { Schema, model } from 'mongoose'

const SavedSearchSchema = new Schema({
    recruiterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    filters: {
        skills: [String],
        minScore: Number,
        maxScore: Number,
        availability: String
    },
    createdAt: { type: Date, default: Date.now }
})

export default model('SavedSearch', SavedSearchSchema)
```

### API Endpoints
```javascript
// In search.routes.js
router.post('/saved-searches', auth, rbac('recruiter'), saveSavedSearch)
router.get('/saved-searches', auth, rbac('recruiter'), getSavedSearches)
router.delete('/saved-searches/:id', auth, rbac('recruiter'), deleteSavedSearch)
```

---

## Feature 6: Email Notifications

### Setup (with Nodemailer)

```bash
npm install nodemailer
```

```javascript
// server/services/EmailService.js
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
})

export const sendNotificationEmail = async (email, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            html
        })
        console.log(`Email sent to ${email}`)
    } catch (error) {
        console.error('Failed to send email:', error)
    }
}

export const sendWeeklyDigest = async (user, activities) => {
    const html = `
        <h2>Your Weekly ContribGraph Digest</h2>
        <p>Hi ${user.username},</p>
        <p>Here's what happened this week:</p>
        <ul>
            ${activities.map(a => `<li>${a.title}</li>`).join('')}
        </ul>
    `
    
    await sendNotificationEmail(user.email, 'Your Weekly Digest', html)
}
```

---

## 🎯 Step-by-Step Feature Checklist

For any new feature:
- [ ] Create MongoDB model (if needed)
- [ ] Create controller with error handling
- [ ] Create/update routes with proper auth
- [ ] Create frontend API methods
- [ ] Create Zustand store (if complex state)
- [ ] Create page or component
- [ ] Add route to App.jsx
- [ ] Add navigation link (if public feature)
- [ ] Test with mock data
- [ ] Add error handling and loading states
- [ ] Style with theme variables
- [ ] Test on both light and dark themes

---

Happy building! 🎉

