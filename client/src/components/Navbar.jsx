import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import { logout as logoutApi } from '../api/auth.api.js'

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()

    const [dark, setDark] = useState(
        () => localStorage.getItem('theme') === 'dark' ||
            window.matchMedia('(prefers-color-scheme: dark)').matches
    )
    const [navScrolled, setNavScrolled] = useState(false)

    // Handle Theme changes
    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark)
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

    // Handle Navbar Background Change on Scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setNavScrolled(true)
            } else {
                setNavScrolled(false)
            }
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = async () => {
        try {
            await logoutApi()
        } finally {
            logout()
            navigate('/login')
        }
    }

    const isActive = (path) => location.pathname === path

    // Dynamic Links based on Authentication State
    const navLinks = [
        { to: '/dashboard', label: 'Dashboard' },
        { to: `/profile/${user?.username}`, label: 'Profile' },
        { to: '/leaderboard', label: 'Leaderboard' },
        user?.role === 'recruiter' && { to: '/search', label: 'Search' }
    ].filter(Boolean)

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            padding: '0 24px',
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: navScrolled ? 'var(--bg-surface)' : 'transparent',
            borderBottom: navScrolled ? '1px solid var(--border)' : '1px solid transparent',
            backdropFilter: navScrolled ? 'blur(12px)' : 'none',
            transition: 'all 0.3s ease'
        }}>
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none' }}>
                <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    fontWeight: 400,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em'
                }}>
                    Contrib<em style={{ color: 'var(--accent-text)', fontStyle: 'italic', fontWeight: 500 }}>Graph</em>
                </span>
            </Link>

            {/* Desktop nav links & Actions Layout */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 32
            }}>
                {/* Dynamically inserted internal React Router Navigation links */}
                {isAuthenticated && (
                    <div style={{ display: 'flex', gap: 28 }} className="nav-links-desktop">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                style={{
                                    color: isActive(link.to) ? 'var(--accent-text)' : 'var(--text-secondary)',
                                    backgroundColor: isActive(link.to) ? 'var(--accent-dim)' : 'transparent',
                                    padding: '6px 14px', // Expanded side spacing applied uniformly here
                                    borderRadius: 8,
                                    textDecoration: 'none',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={e => {
                                    if (!isActive(link.to)) e.currentTarget.style.color = 'var(--accent-text)'
                                }}
                                onMouseLeave={e => {
                                    if (!isActive(link.to)) e.currentTarget.style.color = 'var(--text-secondary)'
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Right utility cluster (Theme, Avatar & Session Buttons) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

                    {/* Theme Toggle Switch */}
                    <button
                        onClick={() => setDark(!dark)}
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            border: '1px solid var(--border)',
                            background: 'var(--bg-elevated)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 15,
                            color: 'var(--text-secondary)',
                            transition: 'all 0.2s ease'
                        }}
                        title={dark ? 'Switch to light' : 'Switch to dark'}
                    >
                        {dark ? '☀️' : '🌙'}
                    </button>

                    {isAuthenticated ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {/* User Profile Avatar */}
                            <img
                                src={user?.avatarUrl}
                                alt={user?.username}
                                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)' }}
                            />

                            {/* Settings Link */}
                            <Link
                                to="/settings"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 34,
                                    height: 34,
                                    borderRadius: 8,
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    transition: 'all 0.15s'
                                }}
                                title="Settings"
                            >
                                ⚙️
                            </Link>

                            {/* Session Sign Out Action */}
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 500,
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
                                    e.currentTarget.style.color = 'var(--text-primary)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                    e.currentTarget.style.color = 'var(--text-secondary)'
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        /* External Identity Provider Authentication Button */
                        <a
                            href="http://localhost:5000/api/auth/github"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 18px',
                                borderRadius: 8,
                                backgroundColor: 'var(--accent)',
                                color: dark ? '#0A1F1E' : '#fff',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: 13,
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-1px)'
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(13,148,136,0.35)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = 'none'
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                            </svg>
                            Sign in with GitHub
                        </a>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar