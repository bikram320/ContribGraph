import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'

const Landing = () => {
    const { isAuthenticated } = useAuthStore()
    const navigate = useNavigate()
    const [scrollY, setScrollY] = useState(0)
    const [visibleSections, setVisibleSections] = useState({})
    const [menuOpen, setMenuOpen] = useState(false)
    const [navScrolled, setNavScrolled] = useState(false)

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard')
        }
    }, [isAuthenticated])

    useEffect(() => {
        window.document.documentElement.style.scrollBehavior = 'smooth'

        const checkSections = () => {
            const sections = document.querySelectorAll('section')
            sections.forEach((section, idx) => {
                const rect = section.getBoundingClientRect()
                if (rect.top < window.innerHeight * 0.75) {
                    setVisibleSections(prev => ({ ...prev, [idx]: true }))
                }
            })
        }

        const handleScroll = () => {
            setScrollY(window.scrollY)
            setNavScrolled(window.scrollY > 20)
            checkSections()
        }

        checkSections()
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'For Recruiters', href: '#recruiters' },
    ]

    // Mini heatmap data — 10 weeks × 7 days of random intensity
    const heatmap = Array.from({ length: 70 }, (_, i) => ({
        level: Math.random() < 0.35 ? 0 : Math.floor(Math.random() * 4) + 1
    }))

    const heatColors = {
        0: 'var(--border)',
        1: 'rgba(13,148,136,0.25)',
        2: 'rgba(13,148,136,0.45)',
        3: 'rgba(13,148,136,0.7)',
        4: 'var(--accent)'
    }

    return (
        <div style={{ backgroundColor: 'var(--bg-base)' }}>

            {/*/!* ── Navbar ── *!/*/}
            {/*<nav style={{*/}
            {/*    position: 'fixed',*/}
            {/*    top: 0,*/}
            {/*    left: 0,*/}
            {/*    right: 0,*/}
            {/*    zIndex: 100,*/}
            {/*    padding: '0 24px',*/}
            {/*    height: 60,*/}
            {/*    display: 'flex',*/}
            {/*    alignItems: 'center',*/}
            {/*    justifyContent: 'space-between',*/}
            {/*    backgroundColor: navScrolled ? 'var(--bg-surface)' : 'transparent',*/}
            {/*    borderBottom: navScrolled ? '1px solid var(--border)' : '1px solid transparent',*/}
            {/*    backdropFilter: navScrolled ? 'blur(12px)' : 'none',*/}
            {/*    transition: 'all 0.3s ease'*/}
            {/*}}>*/}
            {/*    /!* Logo *!/*/}
            {/*    <a href="#" style={{ textDecoration: 'none' }}>*/}
            {/*        <span style={{*/}
            {/*            fontFamily: 'var(--font-display)',*/}
            {/*            fontSize: 20,*/}
            {/*            fontWeight: 400,*/}
            {/*            color: 'var(--text-primary)',*/}
            {/*            letterSpacing: '-0.02em'*/}
            {/*        }}>*/}
            {/*            Contrib<em style={{ color: 'var(--accent-text)', fontStyle: 'italic', fontWeight: 500 }}>Graph</em>*/}
            {/*        </span>*/}
            {/*    </a>*/}

            {/*    /!* Desktop nav links *!/*/}
            {/*    <div style={{*/}
            {/*        display: 'flex',*/}
            {/*        alignItems: 'center',*/}
            {/*        gap: 32*/}
            {/*    }}>*/}
            {/*        <div style={{ display: 'flex', gap: 28 }} className="nav-links-desktop">*/}
            {/*            {navLinks.map((link, i) => (*/}
            {/*                <a key={i} href={link.href} style={{*/}
            {/*                    color: 'var(--text-secondary)',*/}
            {/*                    textDecoration: 'none',*/}
            {/*                    fontSize: 14,*/}
            {/*                    fontWeight: 500,*/}
            {/*                    transition: 'color 0.2s ease',*/}
            {/*                    cursor: 'pointer'*/}
            {/*                }}*/}
            {/*                   onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}*/}
            {/*                   onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}*/}
            {/*                >*/}
            {/*                    {link.label}*/}
            {/*                </a>*/}
            {/*            ))}*/}
            {/*        </div>*/}

            {/*        <a*/}
            {/*            href="http://localhost:5000/api/auth/github"*/}
            {/*            style={{*/}
            {/*                display: 'inline-flex',*/}
            {/*                alignItems: 'center',*/}
            {/*                gap: 8,*/}
            {/*                padding: '8px 18px',*/}
            {/*                borderRadius: 8,*/}
            {/*                backgroundColor: 'var(--accent)',*/}
            {/*                color: 'var(--bg-base)',*/}
            {/*                textDecoration: 'none',*/}
            {/*                fontWeight: 600,*/}
            {/*                fontSize: 13,*/}
            {/*                transition: 'all 0.3s ease',*/}
            {/*                whiteSpace: 'nowrap'*/}
            {/*            }}*/}
            {/*            onMouseEnter={e => {*/}
            {/*                e.currentTarget.style.transform = 'translateY(-1px)'*/}
            {/*                e.currentTarget.style.boxShadow = '0 6px 20px rgba(13,148,136,0.35)'*/}
            {/*            }}*/}
            {/*            onMouseLeave={e => {*/}
            {/*                e.currentTarget.style.transform = 'translateY(0)'*/}
            {/*                e.currentTarget.style.boxShadow = 'none'*/}
            {/*            }}*/}
            {/*        >*/}
            {/*            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">*/}
            {/*                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />*/}
            {/*            </svg>*/}
            {/*            Sign in with GitHub*/}
            {/*        </a>*/}
            {/*    </div>*/}
            {/*</nav>*/}

            {/* ── Hero Section — index 0 ── */}
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '100px 24px 60px',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(to bottom, var(--bg-base), var(--bg-surface))',
                width: '100%'
            }}>
                {/* Background glow */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(135deg, var(--accent-dim) 0%, transparent 50%)',
                    opacity: 0.3,
                    pointerEvents: 'none'
                }} />

                <div style={{
                    maxWidth: 1100,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 64,
                    position: 'relative',
                    zIndex: 1,
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    {/* Left: copy */}
                    <div style={{
                        flex: '1 1 400px',
                        maxWidth: 520,
                        transform: `translateY(${scrollY * 0.15}px)`,
                        transition: 'transform 0.1s ease-out'
                    }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 14px',
                            borderRadius: 20,
                            backgroundColor: 'var(--accent-dim)',
                            border: '1px solid var(--accent)',
                            marginBottom: 24
                        }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'block' }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-text)', letterSpacing: '0.04em' }}>
                                GITHUB REPUTATION PLATFORM
                            </span>
                        </div>

                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 58,
                            fontWeight: 400,
                            color: 'var(--text-primary)',
                            lineHeight: 1.1,
                            marginBottom: 20,
                            letterSpacing: '-0.03em'
                        }}>
                            Contrib<em style={{ color: 'var(--accent-text)', fontStyle: 'italic', fontWeight: 500 }}>Graph</em>
                        </h1>

                        <p style={{
                            fontSize: 18,
                            color: 'var(--text-secondary)',
                            lineHeight: 1.7,
                            marginBottom: 36,
                            fontWeight: 300
                        }}>
                            Your GitHub activity, scored and ranked.{' '}
                            <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                Show recruiters what you actually ship.
                            </strong>
                        </p>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <a
                                href="http://localhost:5000/api/auth/github"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '14px 28px',
                                    borderRadius: 12,
                                    backgroundColor: 'var(--accent)',
                                    color: 'var(--bg-base)',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: 15,
                                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    boxShadow: 'var(--shadow-md)',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(13,148,136,0.4)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                                }}
                            >
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                                </svg>
                                Get Started with GitHub
                            </a>

                            <a
                                href="#features"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '14px 28px',
                                    borderRadius: 12,
                                    backgroundColor: 'transparent',
                                    color: 'var(--text-primary)',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: 15,
                                    border: '2px solid var(--border)',
                                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'var(--accent)'
                                    e.currentTarget.style.backgroundColor = 'var(--accent-dim)'
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)'
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                }}
                            >
                                See How It Works ↓
                            </a>
                        </div>
                    </div>

                    {/* Right: mock profile card */}
                    <div style={{
                        flex: '1 1 320px',
                        maxWidth: 380,
                        transform: `translateY(${scrollY * 0.08}px)`,
                        transition: 'transform 0.1s ease-out'
                    }}>
                        <div style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 16,
                            padding: '28px',
                            boxShadow: 'var(--shadow-md)'
                        }}>
                            {/* Profile header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--accent) 0%, #0d9488 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </div>
                                <div>
                                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>your_handle</p>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>github.com/your_handle</p>
                                </div>
                                {/* Score badge */}
                                <div style={{
                                    marginLeft: 'auto',
                                    textAlign: 'center',
                                    backgroundColor: 'var(--accent-dim)',
                                    border: '1px solid var(--accent)',
                                    borderRadius: 10,
                                    padding: '6px 12px'
                                }}>
                                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--accent-text)', lineHeight: 1 }}>94</p>
                                    <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginTop: 2 }}>SCORE</p>
                                </div>
                            </div>

                            {/* Skill tags */}
                            <div style={{ marginBottom: 20 }}>
                                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                                    Detected Skills
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'GraphQL', 'Rust'].map((skill, i) => (
                                        <span key={i} style={{
                                            padding: '4px 10px',
                                            borderRadius: 6,
                                            backgroundColor: i === 0 ? 'var(--accent-dim)' : 'var(--bg-base)',
                                            border: `1px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'}`,
                                            fontSize: 11,
                                            fontWeight: 500,
                                            color: i === 0 ? 'var(--accent-text)' : 'var(--text-secondary)'
                                        }}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Mini contribution heatmap */}
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                                    Contribution Activity
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3 }}>
                                    {heatmap.map((cell, i) => (
                                        <div key={i} style={{
                                            aspectRatio: '1',
                                            borderRadius: 2,
                                            backgroundColor: heatColors[cell.level]
                                        }} />
                                    ))}
                                </div>
                            </div>

                            {/* Rank row */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: 20,
                                paddingTop: 16,
                                borderTop: '1px solid var(--border)'
                            }}>
                                {[
                                    { label: 'Global Rank', value: '#142' },
                                    { label: 'PRs Merged', value: '318' },
                                    { label: 'Streak', value: '47d' }
                                ].map((item, i) => (
                                    <div key={i} style={{ textAlign: 'center' }}>
                                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</p>
                                        <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Floating label below card */}
                        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                            ↑ Your profile after connecting GitHub
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Features Section — index 1 ── */}
            <section id="features" style={{
                padding: '80px 24px',
                backgroundColor: 'var(--bg-base)',
                width: '100%'
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 64 }}>
                        <p style={{
                            fontSize: 13, fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: '0.1em', color: 'var(--accent-text)', marginBottom: 16
                        }}>Features</p>
                        <h2 style={{
                            fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 400,
                            color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.02em'
                        }}>
                            Everything you need to showcase your skills
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
                        {[
                            {
                                icon: <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 20c0-8.284 6.716-15 15-15s15 6.716 15 15-6.716 15-15 15S5 28.284 5 20z" /><path d="M20 10v10m0 5v2M10 20h10m5 0h2" /></svg>,
                                title: 'Smart Scoring',
                                desc: 'Time-decayed reputation score that measures your actual impact'
                            },
                            {
                                icon: <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="20" cy="20" r="15" /><path d="M20 13v14M13 20h14" /><circle cx="20" cy="20" r="3" fill="currentColor" /></svg>,
                                title: 'Skill Detection',
                                desc: 'AI-powered skill inference from your GitHub repositories'
                            },
                            {
                                icon: <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 20c0-6.627 5.373-12 12-12s12 5.373 12 12-5.373 12-12 12S8 26.627 8 20z" /><path d="M20 14v12M14 20h12" /><path d="M26 14l-12 12" /></svg>,
                                title: 'Recruiter Search',
                                desc: 'Find and be discovered by top companies looking for talent'
                            },
                            {
                                icon: <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 20c0-6.627 5.373-12 12-12s12 5.373 12 12-5.373 12-12 12S8 26.627 8 20z" /><path d="M20 10v20M10 20h20" /></svg>,
                                title: 'Real-time Sync',
                                desc: 'Automatic GitHub activity sync to keep your profile fresh'
                            },
                            {
                                icon: <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 28h24M8 20h24M8 12h24M28 8l4 4-4 4" /></svg>,
                                title: 'Leaderboards',
                                desc: 'See where you stand among developers in your field'
                            },
                            {
                                icon: <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 28v-8M20 28v-14M30 28v-12" /><path d="M32 28H8" /></svg>,
                                title: 'Analytics',
                                desc: 'Detailed insights into your contribution patterns'
                            }
                        ].map((feature, i) => (
                            <div key={i} style={{
                                padding: '28px',
                                borderRadius: 14,
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                cursor: 'pointer',
                                color: 'var(--accent-text)',
                                opacity: visibleSections[1] ? 1 : 0.7,
                                transform: visibleSections[1] ? 'translateY(0)' : 'translateY(20px)'
                            }}
                                 onMouseEnter={e => {
                                     e.currentTarget.style.borderColor = 'var(--accent)'
                                     e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                                     e.currentTarget.style.transform = 'translateY(-4px)'
                                     const svg = e.currentTarget.querySelector('svg')
                                     if (svg) { svg.style.transform = 'scale(1.1) rotate(5deg)'; svg.style.transition = 'all 0.3s ease' }
                                 }}
                                 onMouseLeave={e => {
                                     e.currentTarget.style.borderColor = 'var(--border)'
                                     e.currentTarget.style.boxShadow = 'none'
                                     e.currentTarget.style.transform = 'translateY(0)'
                                     const svg = e.currentTarget.querySelector('svg')
                                     if (svg) svg.style.transform = 'scale(1) rotate(0deg)'
                                 }}
                            >
                                <div style={{ marginBottom: 12, display: 'inline-block', transition: 'all 0.3s ease' }}>
                                    {feature.icon}
                                </div>
                                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
                                    {feature.title}
                                </h3>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works — index 2 ── */}
            <section id="how-it-works" style={{
                padding: '80px 24px',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                background: 'linear-gradient(to bottom, var(--bg-surface), var(--bg-base))',
                width: '100%'
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
                    <p style={{
                        fontSize: 13, fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.1em', color: 'var(--accent-text)', marginBottom: 16
                    }}>How It Works</p>
                    <h2 style={{
                        fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 400,
                        color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 80
                    }}>
                        Get started in 3 simple steps
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
                        {[
                            { step: '01', title: 'Connect GitHub', desc: 'Securely authenticate with your GitHub account. We read your public activity only.' },
                            { step: '02', title: 'Get Scored', desc: 'Our algorithm analyzes your PRs, reviews, and contributions to compute your reputation score.' },
                            { step: '03', title: 'Shine & Share', desc: 'Share your profile with recruiters, build your portfolio, and track your growth.' }
                        ].map((item, i) => (
                            <div key={i} style={{
                                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                opacity: visibleSections[2] ? 1 : 0.7,
                                transform: visibleSections[2] ? 'translateY(0)' : 'translateY(20px)'
                            }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 48, fontWeight: 600, color: 'var(--accent)', marginBottom: 20 }}>
                                    {item.step}
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
                                    {item.title}
                                </h3>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── For Recruiters CTA — index 3 ── */}
            <section id="recruiters" style={{ padding: '80px 24px', backgroundColor: 'var(--bg-base)', width: '100%' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{
                        backgroundColor: 'var(--accent-dim)',
                        borderRadius: 16,
                        padding: '60px 40px',
                        textAlign: 'center',
                        border: '1px solid var(--accent)',
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        opacity: visibleSections[3] ? 1 : 0.7,
                        transform: visibleSections[3] ? 'translateY(0)' : 'translateY(30px)'
                    }}>
                        <h2 style={{
                            fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 400,
                            color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 16
                        }}>
                            For Recruiters & Hiring Managers
                        </h2>
                        <p style={{
                            fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6,
                            maxWidth: 500, margin: '0 auto 32px'
                        }}>
                            Find developers based on actual contributions, not just resumes. Filter by skills, score, and availability.
                        </p>
                        <a
                            href="http://localhost:5000/api/auth/github"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 10,
                                padding: '13px 28px', borderRadius: 10,
                                backgroundColor: 'var(--accent)', color: 'var(--bg-base)',
                                textDecoration: 'none', fontWeight: 600, fontSize: 14,
                                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(13,148,136,0.3)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = 'none'
                            }}
                        >
                            Get Recruiter Access
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{
                backgroundColor: 'var(--bg-surface)',
                borderTop: '1px solid var(--border)',
                padding: '40px 24px',
                width: '100%'
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                        © 2026 ContribGraph. All rights reserved.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                        {[
                            { label: 'About', href: '#' },
                            { label: 'GitHub', href: 'https://github.com' },
                            { label: 'Privacy', href: '#' },
                            { label: 'Terms', href: '#' }
                        ].map((link, i) => (
                            <a key={i} href={link.href} style={{
                                color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13,
                                fontWeight: 500, transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                cursor: 'pointer', display: 'inline-block'
                            }}
                               onMouseEnter={e => {
                                   e.currentTarget.style.color = 'var(--accent-text)'
                                   e.currentTarget.style.transform = 'translateY(-2px)'
                               }}
                               onMouseLeave={e => {
                                   e.currentTarget.style.color = 'var(--text-secondary)'
                                   e.currentTarget.style.transform = 'translateY(0)'
                               }}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Landing