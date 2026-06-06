import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import { logout as logoutApi } from '../api/auth.api.js'
import { GITHUB_AUTH_URL } from '../config/config.js'

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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark)
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // close menus on route change
    useEffect(() => {
        setAvatarMenuOpen(false)
        setMobileMenuOpen(false)
    }, [location.pathname])

    // close avatar menu on outside click
    useEffect(() => {
        if (!avatarMenuOpen) return
        const close = () => setAvatarMenuOpen(false)
        document.addEventListener('click', close)
        return () => document.removeEventListener('click', close)
    }, [avatarMenuOpen])

    // close mobile menu on outside click
    useEffect(() => {
        if (!mobileMenuOpen) return
        const close = (e) => {
            if (!e.target.closest('[data-mobile-menu]') && !e.target.closest('[data-hamburger]')) {
                setMobileMenuOpen(false)
            }
        }
        document.addEventListener('click', close)
        return () => document.removeEventListener('click', close)
    }, [mobileMenuOpen])

    // lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [mobileMenuOpen])

    const handleLogout = async () => {
        try { await logoutApi() } finally {
            logout()
            navigate('/')
        }
    }

    const handleLogoClick = (e) => {
        if (isLanding) {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
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
            <style>{`
                @media (max-width: 640px) {
                    .nav-desktop-links { display: none !important; }
                    .nav-hamburger { display: flex !important; }
                    .nav-theme-btn { display: none !important; }
                }
                @media (min-width: 641px) {
                    .nav-hamburger { display: none !important; }
                }
            `}</style>

            <nav style={{
                position: 'fixed',
                top: 0, left: 0, right: 0,
                zIndex: 100,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                backgroundColor: navBg,
                borderBottom: navBorder,
                backdropFilter: scrolled || !isLanding ? 'blur(14px)' : 'none',
                WebkitBackdropFilter: scrolled || !isLanding ? 'blur(14px)' : 'none',
                transition: 'all 0.25s ease'
            }}>


                {/* Logo Wrapper */}
                <Link
                    to="/"
                    onClick={(e) => {
                        // Prevent default route change if already on the landing view
                        if (window.location.pathname === '/') {
                            e.preventDefault();
                        }
                        // Smoothly scroll to the absolute top of the viewport
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    }}
                    style={{
                        textDecoration: 'none',
                        flexShrink: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 12,
                        cursor: 'pointer',
                        zIndex: 10000,
                        position: 'relative'
                    }}
                >
                    <svg width="38" height="38" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ pointerEvents: 'none' }}>
                        <rect width="100" height="100" rx="22" fill="#112926" stroke="#1e4d46" strokeWidth="1.5" />
                        <g opacity="0.85">
                            <rect x="18" y="18" width="12" height="12" rx="2.5" fill="#14322e" />
                            <rect x="36" y="18" width="12" height="12" rx="2.5" fill="#14322e" />
                            <rect x="54" y="18" width="12" height="12" rx="2.5" fill="#0d9488" opacity="0.4" />
                            <rect x="70" y="18" width="12" height="12" rx="2.5" fill="#2dd4bf" />
                            <rect x="18" y="36" width="12" height="12" rx="2.5" fill="#0d9488" opacity="0.6" />
                            <rect x="36" y="36" width="12" height="12" rx="2.5" fill="#14322e" />
                            <rect x="54" y="36" width="12" height="12" rx="2.5" fill="#14322e" />
                            <rect x="70" y="36" width="12" height="12" rx="2.5" fill="#0d9488" opacity="0.3" />
                            <rect x="18" y="54" width="12" height="12" rx="2.5" fill="#14322e" />
                            <rect x="36" y="54" width="12" height="12" rx="2.5" fill="#2dd4bf" />
                            <rect x="54" y="54" width="12" height="12" rx="2.5" fill="#14322e" />
                            <rect x="70" y="54" width="12" height="12" rx="2.5" fill="#0d9488" opacity="0.7" />
                            <rect x="18" y="70" width="12" height="12" rx="2.5" fill="#0d9488" opacity="0.5" />
                            <rect x="36" y="70" width="12" height="12" rx="2.5" fill="#14322e" />
                            <rect x="54" y="70" width="12" height="12" rx="2.5" fill="#2dd4bf" />
                            <rect x="70" y="70" width="12" height="12" rx="2.5" fill="#14322e" />
                        </g>
                        <path d="M55 15L28 53H47L40 85L72 41H50L55 15Z" fill="#2dd4bf" stroke="#112926" strokeWidth="3" strokeLinejoin="round" />
                    </svg>

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', pointerEvents: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', height: '24px' }}>
                            <span style={{
                                fontFamily: '"Playfair Display", "Clarendon", "Georgia", serif',
                                fontSize: "23px",
                                fontWeight: "700",
                                color: "var(--text-primary)",
                                letterSpacing: "-0.03em"
                            }}>
                                Contrib
                            </span>
                            <span style={{
                                fontFamily: 'var(--font-display), "Inter", "Sans-Serif"',
                                fontSize: "23px",
                                color: "#2dd4bf",
                                fontWeight: "400",
                                letterSpacing: "-0.01em",
                                marginLeft: "2px"
                            }}>
                                Graph
                            </span>
                        </div>

                        <span style={{
                            fontSize: '8px',
                            fontWeight: '700',
                            color: 'var(--text-secondary)',
                            letterSpacing: '0.08em',
                            marginTop: '6px',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-sans), sans-serif'
                        }}>
                            Github Reputation Platform
                        </span>
                    </div>
                </Link>

                {/* Desktop center nav links */}
                <div className="nav-desktop-links" style={{ display: 'flex', gap: 2 }}>
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

                {/* Desktop right side */}
                <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {/* Theme toggle */}
                    <button
                        onClick={() => setDark(d => !d)}
                        style={{
                            width: 36, height: 36,
                            borderRadius: 8,
                            border: '1px solid var(--border)',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14,
                            transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                    >
                        {dark ? '☀' : '◐'}
                    </button>

                    {isAuthenticated ? (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={e => { e.stopPropagation(); setAvatarMenuOpen(v => !v) }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '4px 10px 4px 4px',
                                    borderRadius: 10,
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                            >
                                {user?.avatarUrl && (
                                    <img src={user.avatarUrl} alt={user.username}
                                         style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)' }} />
                                )}
                                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                                    {user?.username}
                                </span>
                                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>▾</span>
                            </button>

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
                                            <span style={{ fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                                            {item.label}
                                        </Link>
                                    ))}

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
                        <a href={GITHUB_AUTH_URL} style={{
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
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                            </svg>
                            Sign in with GitHub
                        </a>
                    )}
                </div>

                {/* Mobile right side: theme + hamburger */}
                <div className="nav-hamburger" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
                    <button
                        onClick={() => setDark(d => !d)}
                        style={{
                            width: 36, height: 36,
                            borderRadius: 8,
                            border: '1px solid var(--border)',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14,
                        }}
                    >
                        {dark ? '☀' : '◐'}
                    </button>

                    <button
                        data-hamburger
                        onClick={() => setMobileMenuOpen(v => !v)}
                        style={{
                            width: 36, height: 36,
                            borderRadius: 8,
                            border: '1px solid var(--border)',
                            background: mobileMenuOpen ? 'var(--accent-dim)' : 'transparent',
                            color: mobileMenuOpen ? 'var(--accent-text)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18,
                            transition: 'all 0.15s'
                        }}
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </nav>

            {/* Mobile menu drawer */}
            {mobileMenuOpen && (
                <div
                    data-mobile-menu
                    style={{
                        position: 'fixed',
                        top: 60, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'var(--bg-surface)',
                        borderTop: '1px solid var(--border)',
                        zIndex: 99,
                        overflowY: 'auto',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                    }}
                >
                    {/* User info (if authenticated) */}
                    {isAuthenticated && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '14px 16px',
                            backgroundColor: 'var(--bg-elevated)',
                            borderRadius: 12,
                            marginBottom: 8,
                            border: '1px solid var(--border)'
                        }}>
                            {user?.avatarUrl && (
                                <img src={user.avatarUrl} alt={user.username}
                                     style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid var(--border)' }} />
                            )}
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{user?.username}</p>
                                <span style={{
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
                        </div>
                    )}

                    {/* Nav links */}
                    {navLinks.map(link => (
                        link.anchor ? (
                            <a key={link.to} href={link.to}
                               onClick={() => setMobileMenuOpen(false)}
                               style={{
                                   display: 'flex', alignItems: 'center',
                                   padding: '13px 16px',
                                   borderRadius: 10,
                                   fontSize: 15,
                                   fontWeight: 500,
                                   textDecoration: 'none',
                                   color: 'var(--text-primary)',
                                   backgroundColor: 'var(--bg-elevated)',
                                   border: '1px solid var(--border)',
                               }}
                            >
                                {link.label}
                            </a>
                        ) : (
                            <Link key={link.to} to={link.to}
                                  style={{
                                      display: 'flex', alignItems: 'center',
                                      padding: '13px 16px',
                                      borderRadius: 10,
                                      fontSize: 15,
                                      fontWeight: 500,
                                      textDecoration: 'none',
                                      color: isActive(link.to) ? 'var(--accent-text)' : 'var(--text-primary)',
                                      backgroundColor: isActive(link.to) ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                                      border: `1px solid ${isActive(link.to) ? 'var(--accent)' : 'var(--border)'}`,
                                  }}
                            >
                                {link.label}
                            </Link>
                        )
                    ))}

                    {/* Extra links for authenticated users */}
                    {isAuthenticated && (
                        <>
                            <Link to="/settings"
                                  style={{
                                      display: 'flex', alignItems: 'center', gap: 10,
                                      padding: '13px 16px',
                                      borderRadius: 10,
                                      fontSize: 15,
                                      fontWeight: 500,
                                      textDecoration: 'none',
                                      color: 'var(--text-primary)',
                                      backgroundColor: 'var(--bg-elevated)',
                                      border: '1px solid var(--border)',
                                  }}
                            >
                                ⚙ Settings
                            </Link>

                            <div style={{ flex: 1 }} />

                            <button
                                onClick={handleLogout}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '13px 16px',
                                    borderRadius: 10,
                                    border: '1px solid var(--red)',
                                    background: 'var(--red-dim)',
                                    color: 'var(--red)',
                                    fontSize: 15,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-sans)',
                                    textAlign: 'left',
                                    width: '100%',
                                    marginTop: 8
                                }}
                            >
                                ↩ Sign Out
                            </button>
                        </>
                    )}

                    {/* Sign in button for unauthenticated */}
                    {!isAuthenticated && (
                        <a href={ GITHUB_AUTH_URL }  style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            padding: '14px 20px',
                            borderRadius: 10,
                            background: 'var(--accent)',
                            color: '#fff',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: 15,
                            marginTop: 8
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                            </svg>
                            Sign in with GitHub
                        </a>
                    )}
                </div>
            )}

            {/* Spacer — only on non-landing pages */}
            {!isLanding && <div style={{ height: 60 }} />}
        </>
    )
}

export default Navbar