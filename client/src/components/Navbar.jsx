import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import { logout as logoutApi } from '../api/auth.api.js'

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()
    const isLanding = location.pathname === '/'

    const [dark, setDark] = useState(
        () => localStorage.getItem('theme') === 'dark' ||
            window.matchMedia('(prefers-color-scheme: dark)').matches
    )
    const [scrolled, setScrolled] = useState(false)
    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark)
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // close avatar menu on route change
    useEffect(() => {
        setAvatarMenuOpen(false)
    }, [location.pathname])

    // close avatar menu on outside click
    useEffect(() => {
        if (!avatarMenuOpen) return
        const close = () => setAvatarMenuOpen(false)
        document.addEventListener('click', close)
        return () => document.removeEventListener('click', close)
    }, [avatarMenuOpen])

    const handleLogout = async () => {
        try { await logoutApi() } finally {
            logout()
            navigate('/')
        }
    }

    const handleLogoClick = (e) => {
        // if already on landing page — scroll to top
        if (isLanding) {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
        // otherwise Link to "/" handles navigation
    }

    const isActive = (path) =>
        path.startsWith('/profile')
            ? location.pathname.startsWith('/profile')
            : location.pathname === path

    const navLinks = isAuthenticated ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: `/profile/${user?.username}`, label: 'Profile' },
        { to: '/leaderboard', label: 'Leaderboard' },
        ...(user?.role === 'recruiter' || user?.role === 'admin'
            ? [{ to: '/search', label: 'Search' }]
            : [])
    ] : [
        { to: '#features', label: 'Features', anchor: true },
        { to: '#how-it-works', label: 'How It Works', anchor: true },
        { to: '#recruiters', label: 'For Recruiters', anchor: true },
    ]

    const navBg = isLanding
        ? scrolled ? 'var(--bg-surface)' : 'transparent'
        : 'var(--bg-surface)'

    const navBorder = isLanding
        ? scrolled ? '1px solid var(--border)' : '1px solid transparent'
        : '1px solid var(--border)'

    return (
        <>
            <nav style={{
                position: 'fixed',
                top: 0, left: 0, right: 0,
                zIndex: 100,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 32px',
                backgroundColor: navBg,
                borderBottom: navBorder,
                backdropFilter: scrolled || !isLanding ? 'blur(14px)' : 'none',
                WebkitBackdropFilter: scrolled || !isLanding ? 'blur(14px)' : 'none',
                transition: 'all 0.25s ease'
            }}>

                {/* Logo */}
                <Link to="/" onClick={handleLogoClick} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em'
          }}>
            Contrib<em style={{ color: 'var(--accent-text)', fontStyle: 'italic' }}>Graph</em>
          </span>
                </Link>

                {/* Center nav links */}
                <div style={{ display: 'flex', gap: 2 }}>
                    {navLinks.map(link => (
                        link.anchor ? (
                            <a key={link.to} href={link.to} style={{
                                padding: '6px 14px',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 500,
                                textDecoration: 'none',
                                color: 'var(--text-secondary)',
                                transition: 'color 0.15s'
                            }}
                               onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
                               onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                {link.label}
                            </a>
                        ) : (
                            <Link key={link.to} to={link.to} style={{
                                padding: '6px 14px',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 500,
                                textDecoration: 'none',
                                color: isActive(link.to) ? 'var(--accent-text)' : 'var(--text-secondary)',
                                backgroundColor: isActive(link.to) ? 'var(--accent-dim)' : 'transparent',
                                transition: 'all 0.15s'
                            }}
                                  onMouseEnter={e => {
                                      if (!isActive(link.to)) e.currentTarget.style.color = 'var(--text-primary)'
                                  }}
                                  onMouseLeave={e => {
                                      if (!isActive(link.to)) e.currentTarget.style.color = 'var(--text-secondary)'
                                  }}
                            >
                                {link.label}
                            </Link>
                        )
                    ))}
                </div>

                {/* Right cluster */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

                    {/* Theme toggle */}
                    <button onClick={() => setDark(!dark)} style={{
                        width: 34, height: 34,
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-elevated)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        transition: 'all 0.15s'
                    }}>
                        {dark ? '☀️' : '🌙'}
                    </button>

                    {isAuthenticated ? (
                        // Avatar with dropdown menu
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setAvatarMenuOpen(!avatarMenuOpen)
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '4px 10px 4px 4px',
                                    borderRadius: 10,
                                    border: '1px solid var(--border)',
                                    background: avatarMenuOpen ? 'var(--bg-elevated)' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                                onMouseLeave={e => {
                                    if (!avatarMenuOpen) e.currentTarget.style.background = 'transparent'
                                }}
                            >
                                <img
                                    src={user?.avatarUrl}
                                    alt={user?.username}
                                    style={{
                                        width: 28, height: 28,
                                        borderRadius: 7,
                                        border: '1px solid var(--border)'
                                    }}
                                />
                                <span style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: 'var(--text-secondary)',
                                    maxWidth: 100,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                  {user?.username}
                </span>
                                <span style={{
                                    fontSize: 10,
                                    color: 'var(--text-muted)',
                                    transform: avatarMenuOpen ? 'rotate(180deg)' : 'rotate(0)',
                                    transition: 'transform 0.2s',
                                    display: 'block'
                                }}>
                  ▾
                </span>
                            </button>

                            {/* Dropdown menu */}
                            {avatarMenuOpen && (
                                <div
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 8px)',
                                        right: 0,
                                        minWidth: 200,
                                        backgroundColor: 'var(--bg-surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 12,
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                        zIndex: 200,
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* User info header */}
                                    <div style={{
                                        padding: '14px 16px',
                                        borderBottom: '1px solid var(--border)',
                                        backgroundColor: 'var(--bg-elevated)'
                                    }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                                            {user?.username}
                                        </p>
                                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                            {user?.email || `@${user?.username}`}
                                        </p>
                                        <span style={{
                                            display: 'inline-block',
                                            marginTop: 6,
                                            padding: '2px 8px',
                                            borderRadius: 4,
                                            fontSize: 10,
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            backgroundColor: 'var(--accent-dim)',
                                            border: '1px solid var(--accent)',
                                            color: 'var(--accent-text)'
                                        }}>
                      {user?.role}
                    </span>
                                    </div>

                                    {/* Menu items */}
                                    {[
                                        { label: 'Dashboard', to: '/dashboard', icon: '⬡' },
                                        { label: 'My Profile', to: `/profile/${user?.username}`, icon: '◎' },
                                        { label: 'Settings', to: '/settings', icon: '⚙' },
                                        { label: 'Leaderboard', to: '/leaderboard', icon: '▲' },
                                    ].map(item => (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                padding: '11px 16px',
                                                textDecoration: 'none',
                                                color: 'var(--text-secondary)',
                                                fontSize: 13,
                                                fontWeight: 500,
                                                transition: 'all 0.1s',
                                                borderBottom: '1px solid var(--border-subtle)'
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
                      <span style={{ fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0 }}>
                        {item.icon}
                      </span>
                                            {item.label}
                                        </Link>
                                    ))}

                                    {/* Logout */}
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            width: '100%',
                                            padding: '11px 16px',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--red)',
                                            fontSize: 13,
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            fontFamily: 'var(--font-sans)',
                                            textAlign: 'left',
                                            transition: 'all 0.1s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--red-dim)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <span style={{ fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0 }}>↩</span>
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <a href="http://localhost:5000/api/auth/github" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 18px',
                            borderRadius: 8,
                            background: 'var(--accent)',
                            color: dark ? '#0A1F1E' : '#fff',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: 13,
                            transition: 'all 0.2s'
                        }}
                           onMouseEnter={e => {
                               e.currentTarget.style.transform = 'translateY(-1px)'
                               e.currentTarget.style.boxShadow = '0 6px 20px rgba(13,148,136,0.3)'
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
            </nav>

            {/* Spacer — only on non-landing pages */}
            {!isLanding && <div style={{ height: 60 }} />}
        </>
    )
}

export default Navbar