# ContribGraph - Development Guide & Architecture

## 🏗️ Project Structure

```
ContribGraph/
├── client/              # React frontend (Vite + React 19)
│   └── src/
│       ├── App.jsx      # Main router
│       ├── pages/       # Route pages
│       ├── components/  # Reusable components
│       ├── hooks/       # Custom React hooks
│       ├── api/         # API client definitions
│       ├── store/       # Zustand state management
│       └── assets/      # Images/SVGs
│
└── server/              # Node.js/Express backend
    ├── index.js         # Server entry point
    ├── routes/          # API endpoints
    ├── controllers/     # Business logic
    ├── models/          # MongoDB schemas
    ├── services/        # Complex operations
    ├── middleware/      # Auth, RBAC, logging
    └── config/          # Database, Passport setup
```

---

## 🚀 How to Add New Features

### 1️⃣ Adding a New Page/Route

#### Step 1: Create the Page Component
Create a new file in `client/src/pages/` (e.g., `YourPage.jsx`):

```jsx
// client/src/pages/YourPage.jsx
import { useState, useEffect } from 'react'
import { yourApiCall } from '../api/your.api.js'

const YourPage = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await yourApiCall()
                setData(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
            {/* Your content */}
        </div>
    )
}

export default YourPage
```

#### Step 2: Create API Methods
Create a new file in `client/src/api/` (e.g., `your.api.js`):

```javascript
// client/src/api/your.api.js
import api from './axios.js'

export const yourApiCall = () => api.get('/your/endpoint')
export const createItem = (data) => api.post('/your/endpoint', data)
export const updateItem = (id, data) => api.patch(`/your/endpoint/${id}`, data)
export const deleteItem = (id) => api.delete(`/your/endpoint/${id}`)
```

#### Step 3: Add Route to App.jsx
```jsx
// client/src/App.jsx
import YourPage from './pages/YourPage.jsx'

// In the <Routes> component:
<Route path="/your-page" element={<YourPage />} />

// For protected routes:
<Route path="/your-page" element={
    <ProtectedRoute allowedRoles={['admin']}>
        <YourPage />
    </ProtectedRoute>
} />
```

#### Step 4: Add Navigation Link (Optional)
Update `client/src/components/Navbar.jsx` to add link to your new page in the nav menu.

---

### 2️⃣ Adding New Backend Routes

#### Step 1: Create Controller
Create a new file in `server/controllers/` (e.g., `your.controller.js`):

```javascript
// server/controllers/your.controller.js
import YourModel from '../models/YourModel.js'

export const getItems = async (req, res) => {
    try {
        const items = await YourModel.find()
        res.status(200).json({ items })
    } catch (error) {
        console.error('getItems error:', error.message)
        res.status(500).json({ message: 'Failed to fetch items.' })
    }
}

export const createItem = async (req, res) => {
    try {
        const { name, description } = req.body
        
        if (!name) {
            return res.status(400).json({ message: 'Name is required.' })
        }

        const item = await YourModel.create({
            name,
            description,
            userId: req.user._id  // from auth middleware
        })

        res.status(201).json({ item })
    } catch (error) {
        console.error('createItem error:', error.message)
        res.status(500).json({ message: 'Failed to create item.' })
    }
}
```

#### Step 2: Create Routes
Create a new file in `server/routes/` (e.g., `your.routes.js`):

```javascript
// server/routes/your.routes.js
import express from 'express'
import { getItems, createItem } from '../controllers/your.controller.js'
import auth from '../middleware/auth.js'
import rbac from '../middleware/rbac.js'

const router = express.Router()

// Public routes
router.get('/items', getItems)

// Protected routes (developer only)
router.post('/items', auth, rbac('developer', 'admin'), createItem)

export default router
```

#### Step 3: Register Routes in Server
Update `server/index.js`:

```javascript
import yourRoutes from './routes/your.routes.js'

// Mount routes
app.use('/api/your', yourRoutes)
```

---

### 3️⃣ Creating a New MongoDB Model

Create a new file in `server/models/` (e.g., `YourModel.js`):

```javascript
// server/models/YourModel.js
import { Schema, model } from 'mongoose'

const YourSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    tags: [String],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

// Indexes for faster queries
YourSchema.index({ userId: 1, isActive: 1 })
YourSchema.index({ tags: 1 })

export default model('YourModel', YourSchema)
```

---

### 4️⃣ Adding Reusable Components

Create a new file in `client/src/components/` (e.g., `YourComponent.jsx`):

```jsx
// client/src/components/YourComponent.jsx
const YourComponent = ({ title, onAction, children, variant = 'default' }) => {
    const variants = {
        default: {
            bg: 'var(--bg-surface)',
            border: 'var(--border)',
            color: 'var(--text-primary)'
        },
        highlight: {
            bg: 'var(--accent-dim)',
            border: 'var(--accent)',
            color: 'var(--accent-text)'
        }
    }

    const style = variants[variant] || variants.default

    return (
        <div style={{
            backgroundColor: style.bg,
            border: `1px solid ${style.border}`,
            borderRadius: 12,
            padding: '16px 20px',
            color: style.color,
            transition: 'all 0.15s'
        }}>
            {title && (
                <h3 style={{
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 12
                }}>
                    {title}
                </h3>
            )}
            {children}
        </div>
    )
}

export default YourComponent
```

---

### 5️⃣ Using Zustand for State Management

Add a new store in `client/src/store/` (e.g., `yourStore.js`):

```javascript
// client/src/store/yourStore.js
import { create } from 'zustand'

const useYourStore = create((set) => ({
    items: [],
    loading: false,
    error: null,

    setItems: (items) => set({ items }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // Methods
    addItem: (item) => set((state) => ({
        items: [...state.items, item]
    })),

    removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item._id !== id)
    })),

    updateItem: (id, changes) => set((state) => ({
        items: state.items.map(item =>
            item._id === id ? { ...item, ...changes } : item
        )
    }))
}))

export default useYourStore
```

Use in components:
```jsx
import useYourStore from '../store/yourStore.js'

const MyComponent = () => {
    const { items, addItem } = useYourStore()
    
    return (
        <div>
            {items.map(item => <div key={item._id}>{item.name}</div>)}
            <button onClick={() => addItem({ name: 'New Item' })}>Add</button>
        </div>
    )
}
```

---

### 6️⃣ Creating Custom Hooks

Create in `client/src/hooks/` (e.g., `useYourFeature.js`):

```javascript
// client/src/hooks/useYourFeature.js
import { useCallback } from 'react'
import { yourApiCall } from '../api/your.api.js'

const useYourFeature = () => {
    const fetch = useCallback(async () => {
        try {
            const res = await yourApiCall()
            return res.data
        } catch (err) {
            console.error(err)
            throw err
        }
    }, [])

    return { fetch }
}

export default useYourFeature
```

---

## 🎨 Design System & Styling

### Theme Variables (CSS)
All components use CSS variables defined in `client/src/index.css`:

```css
/* Light theme (default) */
--bg-base         /* Page background */
--bg-surface      /* Card/surface background */
--bg-elevated     /* Elevated surfaces */
--text-primary    /* Main text */
--text-secondary  /* Secondary text */
--text-muted      /* Disabled/muted text */
--accent          /* Primary brand color */
--accent-dim      /* Accent background */
--accent-text     /* Accent text */
--border          /* Border color */
--shadow-sm       /* Small shadow */
--shadow-md       /* Medium shadow */

/* Also includes: --green, --amber, --red, --indigo with dim variants */
```

### Styling Pattern
All components use inline styles with CSS variables:

```jsx
<div style={{
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '20px 24px',
    color: 'var(--text-primary)'
}}>
    Content
</div>
```

---

## 📊 Common Patterns

### Pagination
```jsx
const [page, setPage] = useState(1)

const handlePageChange = (newPage) => {
    setPage(newPage)
    // Re-fetch with new page
}

// Render pagination
<div style={{ display: 'flex', gap: 10 }}>
    {Array.from({ length: pagination?.pages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => handlePageChange(p)}>
            {p}
        </button>
    ))}
</div>
```

### Error Handling
```jsx
import toast from 'react-hot-toast'

try {
    // API call
} catch (err) {
    console.error(err)
    toast.error(err.response?.data?.message || 'Operation failed')
}
```

### Loading States
```jsx
{loading ? (
    <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
    </div>
) : items.length > 0 ? (
    // Render items
) : (
    // Empty state
)}
```

---

## 🔐 Authentication & Authorization

### Protected Routes
Routes are protected using the `ProtectedRoute` component:

```jsx
<ProtectedRoute>
    <MyComponent />
</ProtectedRoute>

// Role-based access control
<ProtectedRoute allowedRoles={['recruiter', 'admin']}>
    <SearchPage />
</ProtectedRoute>
```

### RBAC Middleware (Backend)
```javascript
// Protect routes with role checks
router.get('/admin-only', auth, rbac('admin'), controllerFunction)

// Multiple roles allowed
router.get('/recruiter-or-admin', auth, rbac('recruiter', 'admin'), controllerFunction)
```

---

## 📱 Responsive Design

Use CSS Grid and Flexbox with media query alternatives:

```jsx
<div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 16
}}>
    {items.map(item => <Card key={item._id} data={item} />)}
</div>
```

---

## 🚢 Deployment

### Frontend
```bash
cd client
npm run build
# Static files in client/dist/
```

### Backend
```bash
# Set environment variables
NODE_ENV=production
MONGODB_URI=your_production_db
# Run server
npm start
```

---

## 📚 Feature Ideas to Extend

1. **User Notifications** - Real-time notifications for profile views, saved by recruiters
2. **Developer Badges/Achievements** - Earn badges for milestones
3. **Saved Searches** - Recruiters can save search filters
4. **Activity Feed** - Global feed of recent developer activity
5. **Skills Endorsements** - Other developers can endorse skills
6. **Portfolio Showcase** - Links to projects, blogs, portfolios
7. **Email Notifications** - Digest emails of activity
8. **Advanced Analytics** - Career insights dashboard
9. **Integration with Job Boards** - Job recommendations
10. **API Documentation** - Public API for third parties

---

## 🐛 Common Issues & Solutions

### Issue: State not updating
**Solution**: Use Zustand's set function properly:
```javascript
// ❌ Wrong
state.items.push(newItem)

// ✅ Correct
set((state) => ({
    items: [...state.items, newItem]
}))
```

### Issue: Infinite re-renders
**Solution**: Add proper dependency arrays to useEffect:
```javascript
// Add all dependencies
useEffect(() => {
    fetch()
}, [dependency1, dependency2])
```

### Issue: CORS errors
**Solution**: Configure in server/index.js:
```javascript
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}))
```

---

## 🔗 Useful Resources

- [React Documentation](https://react.dev)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Mongoose Docs](https://mongoosejs.com)
- [Express Docs](https://expressjs.com)
- [Recharts Docs](https://recharts.org)

---

## 💡 Quick Reference

| Task | File Location |
|------|---------------|
| Add new page | `client/src/pages/` |
| Add API method | `client/src/api/` |
| Add component | `client/src/components/` |
| Add middleware | `server/middleware/` |
| Add route | `server/routes/` |
| Add model | `server/models/` |
| Add store | `client/src/store/` |
| Add hook | `client/src/hooks/` |

---

Happy coding! 🚀

