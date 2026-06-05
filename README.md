# 🚀 ContribGraph

**Your GitHub activity, scored and ranked. Show recruiters what you actually ship.**

ContribGraph is a full-stack web application that analyzes your GitHub contributions, computes a time-decayed reputation score, and helps you showcase your skills to recruiters.

## ✨ Features

### For Developers 👨‍💻
- 📊 **Smart Reputation Score** - AI-powered time-decayed scoring based on PRs, reviews, and commits
- 🔍 **Skill Detection** - Automatic skill inference from your GitHub repositories
- 📈 **Activity Analytics** - Visualize your contribution patterns and growth
- ⚡ **Sync GitHub** - One-click sync to update your profile with latest activity
- 🏆 **Leaderboards** - Compare your score with other developers
- 👀 **Availability Status** - Let recruiters know if you're open to work

### For Recruiters 🔎
- 🎯 **Advanced Search** - Find developers by skills, score range, and availability
- 💾 **Save Shortlists** - Keep track of candidates you're interested in
- 🌐 **Public Profiles** - View detailed developer portfolios
- 📊 **Quality Metrics** - Find developers based on actual contributions, not just resumes

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Ultra-fast build tool
- **Zustand** - Lightweight state management
- **Recharts** - Data visualization
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Tailwind CSS** - Styling framework

### Backend
- **Node.js & Express** - Server runtime and framework
- **MongoDB** - Document database
- **Mongoose** - MongoDB ODM
- **Passport.js** - Authentication middleware
- **GitHub API** - Data ingestion
- **JWT** - Secure tokens
- **Rate Limiting** - Prevent abuse

## 📁 Project Structure

```
ContribGraph/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/                  # Route pages (Profile, Search, Dashboard, etc.)
│   │   ├── components/             # Reusable UI components
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── api/                    # API client methods
│   │   ├── store/                  # Zustand state management
│   │   └── assets/                 # Images and icons
│   └── index.html
│
├── server/                          # Express backend
│   ├── models/                     # MongoDB schemas
│   ├── controllers/                # Business logic
│   ├── routes/                     # API endpoints
│   ├── middleware/                 # Auth, RBAC, logging
│   ├── services/                   # Complex operations
│   └── config/                     # Database, Passport setup
│
├── DEVELOPMENT_GUIDE.md            # How to add features
├── FEATURE_GUIDE.md                # Common feature examples
└── README.md                        # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Client
cd client
npm install

# Server
cd ../server
npm install
```

### 2. Set Environment Variables

Create `.env` in the root and `server/` directories:

```bash
# server/.env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/contribgraph
GITHUB_CLIENT_ID=your_github_oauth_id
GITHUB_CLIENT_SECRET=your_github_oauth_secret
SESSION_SECRET=your_secret_key
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend
cd server
npm start          # Runs on http://localhost:5000

# Terminal 2 - Frontend
cd client
npm run dev        # Runs on http://localhost:5173
```

## 📖 Documentation

### Getting Started
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Complete architecture overview and how to add features
- **[FEATURE_GUIDE.md](./FEATURE_GUIDE.md)** - Common feature implementations (badges, notifications, etc.)

### Key Sections in Guides
- How to add new pages/routes
- How to add backend endpoints
- Creating MongoDB models
- Building reusable components
- State management with Zustand
- Custom React hooks
- Authentication & authorization
- Error handling patterns

## 📚 Pages & Routes

| Route | Purpose | Auth Required |
|-------|---------|--------------|
| `/` | Landing page | No |
| `/login` | OAuth GitHub login | No |
| `/dashboard` | Personal dashboard | Yes (Developer) |
| `/profile/:username` | Public developer profile | No |
| `/search` | Search developers | Yes (Recruiter) |
| `/leaderboard` | Top developers ranking | No |
| `/settings` | Profile settings | Yes (Developer) |

## 🎨 Design System

All components use CSS variables defined in `client/src/index.css`:
- **Colors**: Primary text, secondary text, muted, accent, borders
- **Backgrounds**: Base, surface, elevated
- **Status**: Green (open), amber (busy), red (closed)
- **Themes**: Automatic light/dark mode support

```jsx
// Example: Using theme colors
<div style={{
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    borderRadius: 12
}}>
    Content
</div>
```

## 🔐 Authentication

- **GitHub OAuth 2.0** - Primary authentication
- **Session Management** - HTTP-only cookies
- **JWT Tokens** - API request verification
- **Role-Based Access Control** - Developer vs. Recruiter permissions

## 🚢 Deployment

### Frontend
```bash
npm run build       # Creates optimized build in dist/
# Deploy dist/ folder to Vercel, Netlify, or any static host
```

### Backend
```bash
NODE_ENV=production
npm start           # Start production server
# Deploy to Heroku, AWS, Google Cloud, etc.
```

## 💡 How to Add New Features

### Quick Example: Adding a New Page

```jsx
// 1. Create page file
// client/src/pages/MyFeature.jsx
import { useState, useEffect } from 'react'

const MyFeature = () => {
    const [data, setData] = useState(null)
    
    useEffect(() => {
        // Fetch data
    }, [])
    
    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
            {/* Your UI */}
        </div>
    )
}

export default MyFeature
```

```jsx
// 2. Add route in App.jsx
<Route path="/my-feature" element={<MyFeature />} />
```

For detailed guidance, see [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md).

## 🌟 Feature Ideas

Looking for what to build next? Here are some ideas:

1. **Notifications System** - Real-time alerts for profile views and saves
2. **Developer Badges** - Earn achievements for milestones
3. **Saved Searches** - Recruiters can save search filters
4. **Activity Feed** - Global timeline of recent activity
5. **Skills Endorsements** - Peer endorsements for skills
6. **Portfolio Showcase** - Link external projects and portfolios
7. **Job Board Integration** - Recommendations based on skills
8. **API Documentation** - Public API for third parties
9. **Email Digest** - Weekly activity summaries
10. **Advanced Analytics** - Career insights dashboard

See [FEATURE_GUIDE.md](./FEATURE_GUIDE.md) for implementation examples.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/github` - GitHub OAuth login
- `POST /api/auth/logout` - Logout

### Developers
- `GET /api/developers/me` - Get own profile
- `GET /api/developers/profile/:username` - Get public profile
- `POST /api/developers/sync` - Sync GitHub activity
- `PATCH /api/developers/availability` - Update availability status
- `GET /api/developers/me/events` - Get activity events

### Search (Recruiter only)
- `GET /api/search/developers` - Search developers with filters
- `POST /api/search/saved` - Save a developer
- `GET /api/search/saved` - Get saved developers
- `DELETE /api/search/saved/:developerId` - Remove saved developer

## 🐛 Troubleshooting

### CORS Errors
- Check `CLIENT_URL` in server `.env`
- Ensure credentials are included in API calls

### Database Connection Issues
- Verify `MONGODB_URI` is correct
- Check MongoDB service is running

### GitHub Sync Failing
- Verify GitHub token has correct scopes
- Check rate limits on GitHub API

### SSL Certificate Errors (Mac)
- Run: `sudo /Applications/Python\ 3.x/Install\ Certificates.command`

## 📋 Common Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build           # Build for production
npm run preview         # Preview production build

# Linting
npm run lint            # Check code quality

# Database
# Ensure MongoDB is running locally or connected via URI
```

## 🤝 Contributing

This is an open-source project. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📝 License

MIT License - see LICENSE file for details

## 👉 Next Steps

1. **Read the [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Understand the architecture
2. **Check [FEATURE_GUIDE.md](./FEATURE_GUIDE.md)** - See common patterns
3. **Start building!** - Add your own features

---

## 🙌 Support

For questions or issues:
- Check the guides in this repo
- Review existing code for patterns
- Create an issue for bugs

## 🎯 Key Takeaways

✅ **Modern Stack** - React 19, Node.js, MongoDB  
✅ **Fully Featured** - Auth, search, leaderboards, analytics  
✅ **Well Documented** - Multiple guides for extension  
✅ **Production Ready** - Error handling, validation, security  
✅ **Easy to Extend** - Clear patterns for adding features  

Happy coding! 
