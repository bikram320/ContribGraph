import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profile from './pages/Profile.jsx'
import Search from './pages/Search.jsx'
import useAuth from './hooks/useAuth.js'

const App = () => {
  const { fetchMe } = useAuth()

  // on app load, try to restore session from cookie
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
                fontSize: 13
              }
            }}
        />
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/search" element={
            <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
              <Search />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App