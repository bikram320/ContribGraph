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
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark)
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Close menu on route change
    useEffect(() => { setMenuOpen(false) }, [location.pathname])

    const handleLogout = async () => {
        try { await logoutApi() } finally {
            logout()
            navigate('/')
        }
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
                padding: '0 clamp(20px, 5vw, 56px)',   /* ← responsive horizontal padding */
                backgroundColor: navBg,
                borderBottom: navBorder,
                backdropFilter: scrolled || !isLanding ? 'blur(14px)' : 'none',
                WebkitBackdropFilter: scrolled || !isLanding ? 'blur(14px)' : 'none',
                transition: 'all 0.25s ease',
            }}>

                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 20,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.01em'
                    }}>
                        Contrib<em style={{ color: 'var(--accent-text)', fontStyle: 'italic' }}>Graph</em>
                    </span>
                </Link>

                {/* Center nav links — hidden on mobile */}
                <div style={{
                    display: 'flex', gap: 4,
                    '@media (max-width: 768px)': { display: 'none' }
                }} className="nav-links-desktop">
                    {navLinks.map(link => (
                        link.anchor ? (
                            <a key={link.to} href={link.to} style={{
                                padding: '6px 14px', borderRadius: 8,
                                fontSize: 13, fontWeight: 500,
                                textDecoration: 'none', color: 'var(--text-secondary)',
                                transition: 'color 0.15s'
                            }}
                               onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
                               onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                {link.label}
                            </a>
                        ) : (
                            <Link key={link.to} to={link.to} style={{
                                padding: '6px 14px', borderRadius: 8,
                                fontSize: 13, fontWeight: 500,
                                textDecoration: 'none',
                                color: isActive(link.to) ? 'var(--accent-text)' : 'var(--text-secondary)',
                                backgroundColor: isActive(link.to) ? 'var(--accent-dim)' : 'transparent',
                                transition: 'all 0.15s'
                            }}
                                  onMouseEnter={e => { if (!isActive(link.to)) e.currentTarget.style.color = 'var(--text-primary)' }}
                                  onMouseLeave={e => { if (!isActive(link.to)) e.currentTarget.style.color = 'var(--text-secondary)' }}
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
                        width: 34, height: 34, borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-elevated)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, transition: 'all 0.15s'
                    }}>
                        {dark ? '☀️' : '🌙'}
                    </button>

                    {/* Desktop: auth buttons */}
                    <div className="nav-auth-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {isAuthenticated ? (
                            <>
                                <img
                                    src={user?.avatarUrl}
                                    alt={user?.username}
                                    onClick={() => navigate(`/profile/${user?.username}`)}
                                    style={{
                                        width: 32, height: 32, borderRadius: 8,
                                        border: '2px solid var(--border)',
                                        cursor: 'pointer', transition: 'border-color 0.15s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                    title={`@${user?.username}`}
                                />
                                <span style={{
                                    fontSize: 11, fontFamily: 'var(--font-mono)',
                                    color: 'var(--text-muted)', padding: '2px 8px',
                                    borderRadius: 4, background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border)'
                                }}>{user?.role}</span>
                                <button onClick={handleLogout} style={{
                                    padding: '6px 14px', borderRadius: 8,
                                    fontSize: 12, fontWeight: 500,
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer', transition: 'all 0.15s'
                                }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = 'var(--red-dim)'
                                            e.currentTarget.style.borderColor = 'var(--red)'
                                            e.currentTarget.style.color = 'var(--red)'
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'transparent'
                                            e.currentTarget.style.borderColor = 'var(--border)'
                                            e.currentTarget.style.color = 'var(--text-secondary)'
                                        }}
                                >Logout</button>
                            </>
                        ) : (
                            <a href="http://localhost:5000/api/auth/github" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '8px 18px', borderRadius: 8,
                                background: 'var(--accent)',
                                color: dark ? '#0A1F1E' : '#fff',
                                textDecoration: 'none', fontWeight: 600, fontSize: 13,
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

                    {/* Mobile hamburger */}
                    <button
                        className="nav-hamburger"
                        onClick={() => setMenuOpen(o => !o)}
                        style={{
                            display: 'none',   /* shown via CSS below */
                            width: 34, height: 34, borderRadius: 8,
                            border: '1px solid var(--border)',
                            background: 'var(--bg-elevated)',
                            cursor: 'pointer',
                            alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column', gap: 5, padding: 0
                        }}
                        aria-label="Toggle menu"
                    >
                        {[0, 1, 2].map(i => (
                            <span key={i} style={{
                                display: 'block', width: 16, height: 1.5,
                                backgroundColor: 'var(--text-secondary)',
                                borderRadius: 2,
                                transition: 'all 0.2s',
                                transform: menuOpen
                                    ? i === 0 ? 'translateY(6.5px) rotate(45deg)'
                                        : i === 2 ? 'translateY(-6.5px) rotate(-45deg)'
                                            : 'scaleX(0)'
                                    : 'none',
                                opacity: menuOpen && i === 1 ? 0 : 1
                            }} />
                        ))}
                    </button>
                </div>
            </nav>

            {/* Mobile drawer */}
            {menuOpen && (
                <div style={{
                    position: 'fixed',
                    top: 60, left: 0, right: 0,
                    zIndex: 99,
                    backgroundColor: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border)',
                    padding: '16px clamp(20px, 5vw, 56px) 24px',
                    display: 'flex', flexDirection: 'column', gap: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                }}>
                    {navLinks.map(link => (
                        link.anchor ? (
                            <a key={link.to} href={link.to}
                               onClick={() => setMenuOpen(false)}
                               style={{
                                   padding: '10px 14px', borderRadius: 8,
                                   fontSize: 14, fontWeight: 500,
                                   textDecoration: 'none', color: 'var(--text-secondary)',
                               }}>
                                {link.label}
                            </a>
                        ) : (
                            <Link key={link.to} to={link.to} style={{
                                padding: '10px 14px', borderRadius: 8,
                                fontSize: 14, fontWeight: 500, textDecoration: 'none',
                                color: isActive(link.to) ? 'var(--accent-text)' : 'var(--text-secondary)',
                                backgroundColor: isActive(link.to) ? 'var(--accent-dim)' : 'transparent',
                            }}>
                                {link.label}
                            </Link>
                        )
                    ))}

                    {/* Mobile auth */}
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                        {isAuthenticated ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <img src={user?.avatarUrl} alt={user?.username}
                                     style={{ width: 36, height: 36, borderRadius: 8, border: '2px solid var(--border)' }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>@{user?.username}</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{user?.role}</p>
                                </div>
                                <button onClick={handleLogout} style={{
                                    padding: '6px 14px', borderRadius: 8, fontSize: 12,
                                    border: '1px solid var(--red)', background: 'var(--red-dim)',
                                    color: 'var(--red)', cursor: 'pointer', fontWeight: 500
                                }}>Logout</button>
                            </div>
                        ) : (
                            <a href="http://localhost:5000/api/auth/github" style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                padding: '12px', borderRadius: 8,
                                background: 'var(--accent)', color: dark ? '#0A1F1E' : '#fff',
                                textDecoration: 'none', fontWeight: 600, fontSize: 14
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                                </svg>
                                Sign in with GitHub
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Global CSS for responsive nav */}
            <style>{`
                @media (max-width: 768px) {
                    .nav-links-desktop { display: none !important; }
                    .nav-auth-desktop { display: none !important; }
                    .nav-hamburger { display: flex !important; }
                }
            `}</style>

            {/* Spacer for non-landing pages */}
            {!isLanding && <div style={{ height: 60 }} />}
        </>
    )
}

export default Navbar