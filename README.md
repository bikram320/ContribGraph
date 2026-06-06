# ContribGraph

> A developer reputation platform built on real GitHub activity — not resumes.

![ContribGraph](https://img.shields.io/badge/stack-MERN-2DD4BF?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## What is ContribGraph?

ContribGraph turns your GitHub history into a verifiable reputation score.
Every merged PR, code review, closed issue, and commit is pulled from GitHub,
weighted by importance, and decayed over time so your score always reflects
**recent activity** — not what you did 3 years ago.

Recruiters can search developers by skill and score. Developers get a public
profile they can share instead of a generic resume.

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://contribgraph.vercel.app |
| Backend  | https://contribgraph.onrender.com |

---

## The Score — How It Actually Works

### Event Weights

Every GitHub action has a fixed point value:

| Action | Points | Why |
|--------|--------|-----|
| Merged PR | 10 | Highest signal — code was reviewed and accepted |
| Code Review | 5 | Shows collaborative engineering, not just solo work |
| Issue Closed | 3 | Problem solving and communication |
| Commit Push | 1 | Raw activity signal |
| Comment | 1 | Participation in discussions |

### Time Decay — The Core Idea

Raw point totals are meaningless. A developer with 1000 commits from 5 years
ago and zero activity this year is not more valuable than someone actively
shipping today.

ContribGraph applies **exponential time decay** to every event:

```
decayMultiplier = e^(−λ × ageInDays)
```

Where:
- `e` is Euler's number (~2.718)
- `λ` (lambda) = 0.005 — controls the decay rate
- `ageInDays` = how many days ago the event happened

### What This Means in Practice

```
An event from today:      decay = e^(0)        = 1.0   (100% value)
An event from 30 days:    decay = e^(-0.15)     = 0.86  (86% value)
An event from 138 days:   decay = e^(-0.69)     = 0.50  (50% value)  ← half-life
An event from 1 year:     decay = e^(-1.825)    = 0.16  (16% value)
An event from 2 years:    decay = e^(-3.65)     = 0.026 (2.6% value)
```

The **half-life is ~138 days** — meaning an event from 4.5 months ago is
worth half what it was on the day it happened.

### Final Score Formula

```
score = Σ (event.weight × e^(−0.005 × ageInDays))
```

Summed across every ContribEvent document for that developer.

### Worked Example

Say a developer has three events:

```
Merged PR yesterday:          10 × e^(-0.005 × 1)   = 10 × 0.995 = 9.95 pts
Code review 60 days ago:       5 × e^(-0.005 × 60)  =  5 × 0.741 = 3.70 pts
Commit push 200 days ago:      1 × e^(-0.005 × 200) =  1 × 0.368 = 0.37 pts

Total score = 14.02
```

This makes ContribGraph fundamentally different from GitHub's contribution
graph — which just counts events without weighting or decay.

---

## Full Project Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER FLOW                                │
└─────────────────────────────────────────────────────────────────┘

1.  Developer visits ContribGraph landing page
          ↓
2.  Clicks "Sign in with GitHub"
          ↓
3.  GitHub OAuth authorization screen appears
          ↓
4.  Developer approves → GitHub sends one-time code to our server
          ↓
5.  Server exchanges code for access token via GitHub API
          ↓
6.  Passport fetches GitHub profile (username, email, avatar)
          ↓
7.  Server checks if User exists in MongoDB
      → New user: creates User + Developer documents
      → Existing user: returns existing documents
          ↓
8.  Server signs a JWT { id: userId } with HS256
          ↓
9.  JWT set as HttpOnly cookie (JS cannot read it → XSS safe)
          ↓
10. Browser redirected to /dashboard
          ↓
11. Dashboard loads → fetches /api/auth/me → renders profile


┌─────────────────────────────────────────────────────────────────┐
│                        SYNC FLOW                                │
└─────────────────────────────────────────────────────────────────┘

1.  Developer clicks "Sync GitHub" on Dashboard
          ↓
2.  Enters GitHub Personal Access Token (repo + read:user scopes)
          ↓
3.  POST /api/developers/sync → auth → rbac('developer') → syncLimiter
          ↓
4.  IngestionService.syncDeveloper() runs:
      a. createGitHubClient(accessToken) — axios instance with Bearer token
      b. Promise.all([fetchRepos, fetchPRs, fetchReviews, fetchIssues, fetchPushes])
         — all GitHub API calls run in parallel, not sequentially
      c. storeEvents() — insertMany with ordered:false
         → unique index on githubEventId prevents duplicates
         → error code 11000 (duplicate key) is caught and ignored
      d. buildSkillObjects(repos) — maps language + topics → normalized skill tags
      e. Developer.findByIdAndUpdate() — saves skills, sets lastSyncAt
          ↓
5.  ScoringEngine.computeScore() runs:
      a. Fetches all ContribEvent docs for this developer
      b. For each event: decayMultiplier = Math.exp(-0.005 × ageInDays)
      c. points = event.weight × decayMultiplier
      d. Sums all points → finalScore
      e. ScoreSnapshot.create() — saves score + breakdown to history
      f. Developer.findByIdAndUpdate({ score: finalScore }) — updates cache
          ↓
6.  Response: { score, breakdown, ingestion stats }
          ↓
7.  Dashboard updates score card, breakdown bars, events list


┌─────────────────────────────────────────────────────────────────┐
│                      RECRUITER FLOW                             │
└─────────────────────────────────────────────────────────────────┘

1.  Developer logs in → goes to Settings → switches role to Recruiter
          ↓
2.  PATCH /api/auth/role { role: 'recruiter' } → updates User.role in MongoDB
          ↓
3.  Zustand store updates user.role → Navbar shows Search link
          ↓
4.  Recruiter goes to Search page
          ↓
5.  Fills filters: skills (comma-separated), minScore, availability
          ↓
6.  GET /api/search/developers?skills=react,nodejs&minScore=50
      → auth → rbac('recruiter', 'admin') → searchDevelopers controller
      → builds dynamic MongoDB query
      → Developer.find(query).sort({ score: -1 }) using compound index
          ↓
7.  Results rendered as developer cards
          ↓
8.  Recruiter clicks "+ Save" → POST /api/search/saved
      → User.$addToSet({ savedDevelopers: developerId })
      → $addToSet prevents duplicates automatically
          ↓
9.  Saved tab shows shortlist


┌─────────────────────────────────────────────────────────────────┐
│                   REQUEST LIFECYCLE                             │
│         POST /api/developers/sync (example)                     │
└─────────────────────────────────────────────────────────────────┘

Request arrives
      ↓
generalLimiter     → over 100 req/15min from this IP? → 429
      ↓
auditLogger        → hooks res.send to capture status code later
      ↓
syncLimiter        → over 5 syncs/hour from this IP? → 429
      ↓
auth               → reads JWT from HttpOnly cookie
                   → jwt.verify(token, JWT_SECRET)
                   → User.findById(decoded.id) — fetches fresh from DB
                   → attaches req.user
      ↓
rbac('developer')  → req.user.role === 'developer'? → else 403
      ↓
controller         → IngestionService + ScoringEngine run
      ↓
res.json(result)   → response sent
      ↓
auditLogger        → AuditLog.create({ actor, method, route, ip, status })
                   — written async, does not block response
```

---

## Architecture

### Backend — Service + Controller Separation

```
routes/         → defines endpoints + middleware chain
controllers/    → handles req/res, calls services, returns JSON
services/       → pure business logic, no Express dependency
models/         → Mongoose schemas + indexes
middleware/     → auth, rbac, rateLimiter, auditLogger
config/         → db connection, passport OAuth strategy
```

**Why this separation matters:**
Services have no knowledge of HTTP. `ScoringEngine.computeScore(devId)` takes a
MongoDB ObjectId and returns a plain object. It could be called from a cron job,
a test, or a CLI tool — not just a controller. This is what separates
architecture from glued-together code.

### Middleware Chain

Every protected request passes through:
```
generalLimiter → auditLogger → [route-specific] → auth → rbac → controller
```

### Database Indexes

Two critical indexes power the app:

```js
// Fast recruiter search — covers both filter and sort
developerSchema.index({ 'skills.tag': 1, score: -1 })

// Fast event queries per developer sorted by date
contribEventSchema.index({ devId: 1, occurredAt: -1 })

// Prevents duplicate GitHub events on re-sync
contribEventSchema.index({ githubEventId: 1 }, { unique: true })

// Auto-deletes audit logs after 90 days
auditLogSchema.index({ ts: 1 }, { expireAfterSeconds: 7776000 })
```

### Security Decisions

| Decision | Why |
|----------|-----|
| HttpOnly cookies for JWT | Browser JS cannot read the token → XSS protection |
| `sameSite: 'lax'` on cookie | Prevents CSRF attacks |
| Only `{ id }` in JWT payload | Role changes take effect immediately — no stale token data |
| Fresh DB fetch on every auth check | Deleted/banned users can't use old tokens |
| SHA-256 uniqueId on events | Idempotent sync — re-syncing never creates duplicates |
| Rate limit on sync endpoint | Prevents GitHub API quota exhaustion |

---

## Tech Stack

### Backend
| Package | Purpose |
|---------|---------|
| Express | HTTP server + routing |
| Mongoose | MongoDB ODM + schema validation |
| Passport + passport-github2 | GitHub OAuth 2.0 strategy |
| jsonwebtoken | JWT sign and verify |
| cookie-parser | Read HttpOnly cookies |
| express-rate-limit | Request throttling |
| axios | GitHub REST API calls |
| dotenv | Environment variable loading |
| cors | Cross-origin request handling |
| bcryptjs | Included but unused in MVP (for future password auth) |

### Frontend
| Package | Purpose |
|---------|---------|
| React 18 + Vite | UI framework + build tool |
| React Router DOM | Client-side routing |
| Zustand | Lightweight global state (auth, developer profile) |
| Axios | API calls with cookie credentials |
| Recharts | Score breakdown and activity charts |
| react-hot-toast | Non-intrusive notifications |
| Tailwind CSS v4 | Utility CSS via @tailwindcss/vite |

---

## MongoDB Collections

```
users           → login identity (githubId, username, role, savedDevelopers)
developers      → public profile (skills, score, availability, lastSyncAt)
contribevents   → one GitHub action (type, weight, repoName, occurredAt)
scoresnapshots  → one computed score (score, breakdown, computedAt)
auditlogs       → one request record (actor, method, route, ip, status)
```

---

## API Reference

```
AUTH
GET    /api/auth/github                   Redirect to GitHub OAuth
GET    /api/auth/github/callback          OAuth callback — sets JWT cookie
GET    /api/auth/me                       Current user + developer profile
POST   /api/auth/logout                   Clear JWT cookie
PATCH  /api/auth/role                     Switch role (developer ↔ recruiter)

DEVELOPERS
GET    /api/developers/profile/:username  Public profile (no auth)
GET    /api/developers/me                 Own profile (developer)
GET    /api/developers/me/events          Own events paginated (developer)
PATCH  /api/developers/availability       Update open/busy/closed (developer)
POST   /api/developers/sync              Sync GitHub + recompute score (developer)

SCORES
GET    /api/scores/:username             Current score (public)
GET    /api/scores/:username/breakdown   Score breakdown by type (public)
GET    /api/scores/:username/history     Score history snapshots (auth)
POST   /api/scores/:username/recompute   Force recompute (admin)

SEARCH
GET    /api/search/leaderboard           Top developers by score (public)
GET    /api/search/developers            Filter developers (recruiter)
POST   /api/search/saved                 Save to shortlist (recruiter)
GET    /api/search/saved                 Get shortlist (recruiter)
DELETE /api/search/saved/:developerId    Remove from shortlist (recruiter)
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- GitHub OAuth App

### 1. Clone and install

```bash
git clone https://github.com/yourusername/contribgraph.git
cd contribgraph

# root dependencies
npm install

# backend
cd server && npm install && cd ..

# frontend
cd client && npm install && cd ..
```

### 2. Create GitHub OAuth App

Go to [github.com/settings/developers](https://github.com/settings/developers)
→ New OAuth App:

```
Application name:  ContribGraph
Homepage URL:      http://localhost:5173
Callback URL:      http://localhost:5000/api/auth/github/callback
```

Copy the Client ID and generate a Client Secret.

### 3. Environment variables

```bash
cp server/.env.example server/.env
```

Fill in `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/contribgraph
JWT_SECRET=run_this_to_generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

### 4. Run

```bash
# from root — starts both client and server
npm run dev

# or separately
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

---

## Deployment

### Backend → Render

1. New Web Service → connect GitHub repo
2. Root directory: `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all `.env` variables in Render dashboard
6. Change `GITHUB_CALLBACK_URL` to your Render URL
7. Change `CLIENT_URL` to your Vercel URL

### Frontend → Vercel

1. New Project → connect GitHub repo
2. Root directory: `client`
3. Add env variable: `VITE_API_URL=https://your-app.onrender.com/api`
4. Deploy

### Update GitHub OAuth App

After deploying, update your GitHub OAuth App callback URL to:
```
https://your-app.onrender.com/api/auth/github/callback
```

---

## What I Would Add Next

- **GitHub access token storage** — currently users paste their PAT on every sync. The OAuth flow could store the token server-side (encrypted) and auto-sync on a schedule
- **Streak tracking** — consecutive days with activity
- **Email notifications** — weekly score digest
- **Score comparison** — compare two developer profiles side by side
- **Organization profiles** — team-level scores for companies
- **Webhook integration** — sync automatically on push instead of manually

---

## Project Structure

```
contribgraph/
├── client/                    React + Vite + Tailwind + Zustand
│   └── src/
│       ├── api/               axios instance + API functions
│       ├── components/        Navbar, ScoreCard, ActivityChart, ProtectedRoute
│       ├── hooks/             useAuth
│       ├── pages/             Landing, Dashboard, Profile, Search, Leaderboard, Settings
│       └── store/             authStore, developerStore
│
├── server/                    Express + MongoDB
│   ├── config/                db.js, passport.js
│   ├── controllers/           auth, developer, score, search
│   ├── middleware/            auth, rbac, rateLimiter, auditLogger
│   ├── models/                User, Developer, ContribEvent, ScoreSnapshot, AuditLog
│   ├── routes/                auth, developer, score, search
│   ├── services/              IngestionService, ScoringEngine, TagInferenceService
│   └── index.js
│
├── .gitignore
├── package.json               root — concurrently scripts
└── README.md
```

---
*Built with the MERN stack — MongoDB, Express, React, Node.js*
*by Bikram Bishwokarma*