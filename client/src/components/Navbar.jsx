import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import { logout as logoutApi } from '../api/auth.api.js'

const Navbar = () => {
    const { user, developer, isAuthenticated, logout } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()
    const [dark, setDark] = useState(
        () => localStorage.getItem('theme') === 'dark' ||
            window.matchMedia('(prefers-color-scheme: dark)').matches
    )
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark)
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

    const handleLogout = async () => {
        try {
            await logoutApi()
        } finally {
            logout()
            navigate('/login')
        }
    }

    const isActive = (path) => location.pathname === path

    return (
        <nav style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-primary)' }}>
            Contrib<em style={{ color: 'var(--accent-text)', fontStyle: 'italic' }}>Graph</em>
          </span>
                </Link>

                {/* Nav links */}
                {isAuthenticated && (
                    <div style={{ display: 'flex', gap: 4 }}>
                        {[
                            { to: '/dashboard', label: 'Dashboard' },
                            { to: `/profile/${user?.username}`, label: 'Profile' },
                            user?.role === 'recruiter' && { to: '/search', label: 'Search' }
                        ].filter(Boolean).map(link => (
                            <Link key={link.to} to={link.to} style={{
                                padding: '6px 14px',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 500,
                                textDecoration: 'none',
                                color: isActive(link.to) ? 'var(--accent-text)' : 'var(--text-secondary)',
                                backgroundColor: isActive(link.to) ? 'var(--accent-dim)' : 'transparent',
                                transition: 'all 0.15s'
                            }}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                    {/* Theme toggle */}
                    <button
                        onClick={() => setDark(!dark)}
                        style={{
                            width: 34, height: 34,
                            borderRadius: 8,
                            border: '1px solid var(--border)',
                            background: 'var(--bg-elevated)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            color: 'var(--text-secondary)'
                        }}
                        title={dark ? 'Switch to light' : 'Switch to dark'}
                    >
                        {dark ? '☀️' : '🌙'}
                    </button>

                    {isAuthenticated ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <img
                                src={user?.avatarUrl}
                                alt={user?.username}
                                style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)' }}
                            />
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: 8,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer'
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <a
                            href="http://localhost:5000/api/auth/github"
                            style={{
                                padding: '7px 16px',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 500,
                                background: 'var(--accent)',
                                color: dark ? '#0A1F1E' : '#fff',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                            }}
                        >
                            <span>⬡</span> Login with GitHub
                        </a>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar