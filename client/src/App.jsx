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
import useAuthStore from './store/authStore.js'

const App = () => {
    const { isAuthenticated, isLoading } = useAuthStore()
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

                <Route
                    path="/"
                    element={
                        // ← FIX: don't redirect while still loading — wait for fetchMe
                        isLoading
                            ? null
                            : isAuthenticated
                                ? <Navigate to="/dashboard" replace />
                                : <Landing />
                    }
                />

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

                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </BrowserRouter>
    )
}

export default App