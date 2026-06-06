import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profile from './pages/Profile.jsx'
import Search from './pages/Search.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Settings from './pages/Settings.jsx'
import useAuth from './hooks/useAuth.js'
import useAuthStore from './store/authStore.js'

const App = () => {
    const { isAuthenticated } = useAuthStore()

    const fetchMe = useAuthStore((state) => state.fetchMe)
    useEffect(() => { fetchMe() }, [])

    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13,
                        borderRadius: 10
                    }
                }}
            />
            <Navbar />
            <Routes>

                {/* ── Public routes — no auth needed ───────────────── */}
                <Route
                    path="/"
                    element={
                        // if already logged in, skip landing → go straight to dashboard
                        isAuthenticated
                            ? <Navigate to="/dashboard" replace />
                            : <Landing />
                    }
                />

                {/* OAuth callback landing point
            GitHub redirects to /dashboard after callback
            fetchMe() in useEffect picks up the cookie automatically */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/leaderboard" element={<Leaderboard />} />

                {/* ── Protected routes ──────────────────────────────── */}
                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/search"
                    element={
                        <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                            <Search />
                        </ProtectedRoute>
                    }
                />

                {/* ── Catch all — no login page, just back to home ─── */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>
        </BrowserRouter>
    )
}

export default App