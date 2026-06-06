import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import {GITHUB_AUTH_URL} from "../config/config.js";

const GitHubIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
)

const useIsMobile = () => {
    const [mobile, setMobile] = useState(() => window.innerWidth < 768)
    useEffect(() => {
        const fn = () => setMobile(window.innerWidth < 768)
        window.addEventListener('resize', fn)
        return () => window.removeEventListener('resize', fn)
    }, [])
    return mobile
}

const Landing = () => {
    const { isAuthenticated, isLoading } = useAuthStore()
    const navigate = useNavigate()
    const isMobile = useIsMobile()
    const [scrollY, setScrollY] = useState(0)
    const [visibleSections, setVisibleSections] = useState({})

    const heatmap = useMemo(() =>
        Array.from({ length: 70 }, () => ({
            level: Math.random() < 0.35 ? 0 : Math.floor(Math.random() * 4) + 1
        })), []
    )

    const heatColors = {
        0: 'var(--border)',
        1: 'rgba(13,148,136,0.2)',
        2: 'rgba(13,148,136,0.4)',
        3: 'rgba(13,148,136,0.65)',
        4: 'var(--accent)'
    }

    useEffect(() => {
        // Wait for fetchMe to finish before redirecting.
        // Without the isLoading check, Landing redirects to /dashboard
        // while the cookie is still being verified — causing the loop.
        if (!isLoading && isAuthenticated) {
            navigate('/dashboard', { replace: true })
        }
    }, [isAuthenticated, isLoading])

    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth'

        const checkSections = () => {
            const sections = document.querySelectorAll('section[data-idx]')
            sections.forEach(section => {
                const idx = parseInt(section.dataset.idx)
                const rect = section.getBoundingClientRect()
                if (rect.top < window.innerHeight * 0.85) {
                    setVisibleSections(prev => ({ ...prev, [idx]: true }))
                }
            })
        }

        const handleScroll = () => {
            setScrollY(window.scrollY)
            checkSections()
        }

        checkSections()
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const fadeIn = (idx, delay = 0) => ({
        opacity: visibleSections[idx] ? 1 : 0,
        transform: visibleSections[idx] ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`
    })

    const features = [
        { icon: '⬡', title: 'Smart Scoring', desc: 'Time-decayed reputation score that measures your actual impact, not just total commits.' },
        { icon: '◈', title: 'Skill Detection', desc: 'Automatically infers your skills from repo languages and topics across all your projects.' },
        { icon: '◎', title: 'Recruiter Search', desc: 'Get discovered by companies looking for real contributors, not just resume keywords.' },
        { icon: '↻', title: 'Real-time Sync', desc: 'GitHub sync keeps your profile fresh. Score updates every time you push or merge.' },
        { icon: '▲', title: 'Leaderboard', desc: 'See where you stand among developers in your field. Compete on contribution, not clout.' },
        { icon: '◐', title: 'Analytics', desc: 'Breakdown of exactly where your score comes from — PRs, reviews, issues, and commits.' }
    ]

    return (
        <div style={{ backgroundColor: 'var(--bg-base)', overflowX: 'hidden' }}>

            {/* ── Hero ── */}
            <section data-idx="0" style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '100px 20px 60px' : '80px 32px 60px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: '-20%', left: '-10%',
                    width: '60%', height: '80%',
                    background: 'radial-gradient(ellipse, var(--accent-dim) 0%, transparent 70%)',
                    opacity: 0.5, pointerEvents: 'none', zIndex: 0
                }} />
                <div style={{
                    position: 'absolute', bottom: '-10%', right: '-10%',
                    width: '50%', height: '60%',
                    background: 'radial-gradient(ellipse, var(--indigo-dim) 0%, transparent 70%)',
                    opacity: 0.3, pointerEvents: 'none', zIndex: 0
                }} />

                <div style={{
                    maxWidth: 1100, width: '100%',
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: isMobile ? 48 : 64,
                    alignItems: 'center',
                    position: 'relative', zIndex: 1
                }}>
                    {/* Left: copy */}
                    <div style={{ transform: isMobile ? 'none' : `translateY(${scrollY * 0.08}px)` }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '5px 14px', borderRadius: 20,
                            backgroundColor: 'var(--accent-dim)',
                            border: '1px solid var(--accent)',
                            marginBottom: 28
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'block' }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>GitHub Reputation Platform</span>
                        </div>

                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: isMobile ? 'clamp(40px, 12vw, 56px)' : 'clamp(40px, 5vw, 64px)',
                            fontWeight: 400, color: 'var(--text-primary)',
                            lineHeight: 1.08, marginBottom: 24, letterSpacing: '-0.03em'
                        }}>
                            Contrib<em style={{ color: 'var(--accent-text)', fontStyle: 'italic' }}>Graph</em>
                        </h1>

                        <p style={{ fontSize: isMobile ? 16 : 18, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 16, fontWeight: 300, maxWidth: 460 }}>
                            Your GitHub activity, scored and ranked.
                        </p>
                        <p style={{ fontSize: isMobile ? 16 : 18, color: 'var(--text-primary)', lineHeight: 1.75, marginBottom: 40, fontWeight: 500, maxWidth: 460 }}>
                            Show recruiters what you actually ship — not what your resume claims.
                        </p>

                        <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap' }}>
                            <a href={GITHUB_AUTH_URL} style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                padding: '13px 26px', borderRadius: 10,
                                backgroundColor: 'var(--accent)', color: 'var(--bg-base)',
                                textDecoration: 'none', fontWeight: 600, fontSize: 14,
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 14px rgba(13,148,136,0.25)'
                            }}
                               onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,148,136,0.4)' }}
                               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(13,148,136,0.25)' }}
                            >
                                <GitHubIcon size={16} />
                                Get Started with GitHub
                            </a>
                            <a href="#how-it-works" style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                padding: '13px 26px', borderRadius: 10,
                                backgroundColor: 'transparent', color: 'var(--text-primary)',
                                textDecoration: 'none', fontWeight: 500, fontSize: 14,
                                border: '1px solid var(--border)', transition: 'all 0.2s ease'
                            }}
                               onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.backgroundColor = 'var(--accent-dim)'; e.currentTarget.style.color = 'var(--accent-text)' }}
                               onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-primary)' }}
                            >How It Works ↓</a>
                        </div>

                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span></span> Read-only access · No private data · No writing to your GitHub
                        </p>
                    </div>

                    {/* Right: mock profile card */}
                    <div style={{ transform: isMobile ? 'none' : `translateY(${scrollY * 0.04}px)` }}>
                        <div style={{
                            backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
                            borderRadius: 16, padding: isMobile ? 20 : 28,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.12)', position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute', top: -14, right: 24,
                                backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--accent)',
                                borderRadius: 10, padding: '8px 16px',
                                display: 'flex', alignItems: 'center', gap: 8
                            }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--green)', display: 'block' }} />
                                <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>Open to Work</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, marginTop: 8 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                                    background: 'linear-gradient(135deg, var(--accent) 0%, var(--indigo) 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}><GitHubIcon size={22} /></div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>your_handle</p>
                                    <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>@your_handle</p>
                                </div>
                                <div style={{ backgroundColor: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 10, padding: '8px 14px', textAlign: 'center', flexShrink: 0 }}>
                                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--accent-text)', lineHeight: 1 }}>247</p>
                                    <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginTop: 3 }}>SCORE</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Detected Skills</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                    {['typescript', 'react', 'nodejs', 'postgresql', 'docker', 'graphql'].map((skill, i) => (
                                        <span key={i} style={{
                                            padding: '3px 9px', borderRadius: 5,
                                            backgroundColor: i === 0 ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                                            border: `1px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'}`,
                                            fontSize: 11, fontFamily: 'var(--font-mono)',
                                            color: i === 0 ? 'var(--accent-text)' : 'var(--text-secondary)'
                                        }}>{skill}</span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Contribution Activity</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3 }}>
                                    {heatmap.map((cell, i) => (
                                        <div key={i} style={{ aspectRatio: '1', borderRadius: 2, backgroundColor: heatColors[cell.level] }} />
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                                {[
                                    { label: 'PRs Merged', value: '34', color: 'var(--accent-text)' },
                                    { label: 'Reviews', value: '28', color: 'var(--green)' },
                                    { label: 'Issues', value: '19', color: 'var(--amber)' }
                                ].map((stat, i) => (
                                    <div key={i} style={{ textAlign: 'center' }}>
                                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: stat.color, marginBottom: 3 }}>{stat.value}</p>
                                        <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 12, fontFamily: 'var(--font-mono)' }}>
                            ↑ your profile after connecting GitHub
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Social proof strip ── */}
            <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '20px 24px', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: isMobile ? 24 : 48, flexWrap: 'wrap' }}>
                    {[
                        { val: 'PRs', label: 'Weighted 10 pts each' },
                        { val: 'Reviews', label: 'Weighted 5 pts each' },
                        { val: 'Decay', label: 'e^(−λ × days)' },
                        { val: 'Real', label: 'No fake scores' }
                    ].map((item, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, color: 'var(--accent-text)', marginBottom: 3 }}>{item.val}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Features ── */}
            <section id="features" data-idx="1" style={{ padding: isMobile ? '64px 20px' : '96px 32px', backgroundColor: 'var(--bg-base)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-text)', marginBottom: 14 }}>Features</p>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 'clamp(28px, 8vw, 40px)' : 'clamp(32px, 4vw, 48px)', fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                            Everything you need to showcase your skills
                        </h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                        {features.map((feature, i) => (
                            <div key={i} style={{ padding: '24px', borderRadius: 14, backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', cursor: 'default', transition: 'all 0.2s ease', ...fadeIn(1, i * 0.07) }}
                                 onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
                                 onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                            >
                                <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'var(--accent-dim)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--accent-text)', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>{feature.icon}</div>
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.01em' }}>{feature.title}</h3>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section id="how-it-works" data-idx="2" style={{ padding: isMobile ? '64px 20px' : '96px 32px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: isMobile ? 48 : 72 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-text)', marginBottom: 14 }}>How It Works</p>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 'clamp(28px, 8vw, 40px)' : 'clamp(32px, 4vw, 48px)', fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                            Up and running in three steps
                        </h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 32 : 40, position: 'relative' }}>
                        {!isMobile && <div style={{ position: 'absolute', top: 28, left: '16%', right: '16%', height: 1, backgroundColor: 'var(--border)', zIndex: 0 }} />}
                        {[
                            { step: '01', title: 'Connect GitHub', desc: 'Authenticate securely with GitHub OAuth. We request read-only access — nothing is written to your account.' },
                            { step: '02', title: 'Get Scored', desc: 'Our scoring engine fetches your PRs, reviews, and commits, then applies time-decay to compute your reputation score.' },
                            { step: '03', title: 'Get Discovered', desc: 'Your public profile is searchable by recruiters. Share the link, track your growth, and climb the leaderboard.' }
                        ].map((item, i) => (
                            <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1, ...fadeIn(2, i * 0.1) }}>
                                <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--accent-text)' }}>{item.step}</div>
                                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.01em' }}>{item.title}</h3>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 280, margin: '0 auto' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── For Recruiters CTA ── */}
            <section id="recruiters" data-idx="3" style={{ padding: isMobile ? '64px 20px' : '96px 32px', backgroundColor: 'var(--bg-base)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 20, padding: isMobile ? '40px 24px' : '64px 48px', textAlign: 'center', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', ...fadeIn(3) }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at center top, var(--accent-dim) 0%, transparent 60%)', opacity: 0.6, pointerEvents: 'none' }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-text)', marginBottom: 16 }}>For Recruiters</p>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 'clamp(24px, 7vw, 36px)' : 'clamp(28px, 3.5vw, 44px)', fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 16 }}>
                                Find developers who actually ship.
                            </h2>
                            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 36px' }}>
                                Filter by skills, score, and availability. Every profile is backed by verifiable GitHub activity — no inflated resumes.
                            </p>
                            <a href={ GITHUB_AUTH_URL }  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 28px', borderRadius: 10, backgroundColor: 'var(--accent)', color: 'var(--bg-base)', textDecoration: 'none', fontWeight: 600, fontSize: 14, transition: 'all 0.2s ease' }}
                               onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,148,136,0.35)' }}
                               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                            >Get Recruiter Access</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: isMobile ? '32px 20px' : '40px 32px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 20 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)' }}>
                            Contrib<em style={{ color: 'var(--accent-text)', fontStyle: 'italic' }}>Graph</em>
                        </span>
                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                            {[
                                { label: 'Leaderboard', href: '/leaderboard' },
                                { label: 'GitHub', href: 'https://github.com' },
                                { label: 'Privacy', href: '#' },
                                { label: 'Terms', href: '#' }
                            ].map((link, i) => (
                                <a key={i} href={link.href} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.15s' }}
                                   onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
                                   onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                >{link.label}</a>
                            ))}
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>© 2026 ContribGraph</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Landing