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
import useAuth from './hooks/useAuth.js'
import Login from './pages/Login.jsx'
import useAuthStore from './store/authStore.js'

const App = () => {
    const { fetchMe } = useAuth()
    const { isAuthenticated } = useAuthStore()

    useEffect(() => {
        fetchMe()
    }, [])

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
                {/* public */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/leaderboard" element={<Leaderboard />} />

                {/* protected */}
                <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="/search" element={
                    <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                        <Search />
                    </ProtectedRoute>
                } />

                {/* fallback */}
                <Route path="*" element={
                    <Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default App