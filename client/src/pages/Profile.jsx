import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPublicProfile } from '../api/developer.api.js'
import api from '../api/axios.js'
import ActivityChart from '../components/ActivityChart.jsx'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore.js'

const EVENT_LABELS = {
    pr_merged: 'Merged PRs',
    review: 'Code Reviews',
    issue_closed: 'Issues Closed',
    push: 'Commits',
    comment: 'Comments'
}

const EVENT_COLORS = {
    pr_merged: 'var(--accent)',
    review: 'var(--green)',
    issue_closed: 'var(--amber)',
    push: 'var(--indigo)',
    comment: 'var(--text-muted)'
}

const GitHubIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
)

const useIsMobile = () => {
    const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
    useEffect(() => {
        const fn = () => setMobile(window.innerWidth < 768)
        window.addEventListener('resize', fn)
        return () => window.removeEventListener('resize', fn)
    }, [])
    return mobile
}

const Profile = () => {
    const { username } = useParams()
    const { user } = useAuthStore()
    const isMobile = useIsMobile()
    const [developer, setDeveloper] = useState(null)
    const [breakdown, setBreakdown] = useState(null)
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const isOwnProfile = user?.username === username

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                const [profileRes, breakdownRes] = await Promise.allSettled([
                    getPublicProfile(username),
                    api.get(`/scores/${username}/breakdown`)
                ])
                if (profileRes.status === 'fulfilled') {
                    setDeveloper(profileRes.value.data.developer)
                } else {
                    setError('Developer not found.')
                    return
                }
                if (breakdownRes.status === 'fulfilled') {
                    setBreakdown(breakdownRes.value.data.breakdown)
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load profile.')
                toast.error('Failed to load profile.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [username])

    if (loading) {
        return (
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                    loading profile...
                </p>
            </div>
        )
    }

    if (error || !developer) {
        return (
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
                <div style={{
                    backgroundColor: 'var(--red-dim)',
                    border: '1px solid var(--red)',
                    borderRadius: 12,
                    padding: '20px 24px',
                    color: 'var(--red)',
                    fontSize: 14
                }}>
                    ✗ {error || 'Developer not found.'}
                </div>
            </div>
        )
    }

    const devUser = developer.userId
    const availabilityMap = {
        open: { label: 'Open to Work', bg: 'var(--green-dim)', color: 'var(--green)' },
        busy: { label: 'Busy', bg: 'var(--amber-dim)', color: 'var(--amber)' },
        closed: { label: 'Not Available', bg: 'var(--red-dim)', color: 'var(--red)' }
    }
    const avail = availabilityMap[developer.availability]

    const maxBreakdown = breakdown?.breakdown
        ? Math.max(...Object.values(breakdown.breakdown).filter(v => typeof v === 'number'), 1)
        : 1

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 24px' }}>

            {/* Own profile banner */}
            {isOwnProfile && (
                <div style={{
                    backgroundColor: 'var(--accent-dim)',
                    border: '1px solid var(--accent)',
                    borderRadius: 10,
                    padding: '10px 16px',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    justifyContent: 'space-between',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: 10
                }}>
                    <span style={{ fontSize: 13, color: 'var(--accent-text)' }}>
                        This is your public profile — this is what recruiters see.
                    </span>
                    <Link to="/dashboard" style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--accent-text)',
                        textDecoration: 'none',
                        padding: '5px 12px',
                        borderRadius: 6,
                        border: '1px solid var(--accent)',
                        transition: 'all 0.15s',
                        alignSelf: isMobile ? 'flex-start' : 'auto'
                    }}>
                        ← Dashboard
                    </Link>
                </div>
            )}

            {/* Two-column layout — stacks on mobile */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 300px',
                gap: 24,
                alignItems: 'start'
            }}>

                {/* Left — main content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Profile header card */}
                    <div style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 16,
                        padding: isMobile ? '20px' : '28px'
                    }}>
                        <div style={{ display: 'flex', gap: isMobile ? 14 : 20, alignItems: 'flex-start' }}>
                            <img
                                src={devUser?.avatarUrl}
                                alt={devUser?.username}
                                style={{
                                    width: isMobile ? 60 : 80,
                                    height: isMobile ? 60 : 80,
                                    borderRadius: 16,
                                    border: '2px solid var(--border)',
                                    flexShrink: 0
                                }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                                    <h1 style={{
                                        fontSize: isMobile ? 20 : 26,
                                        fontWeight: 600,
                                        color: 'var(--text-primary)',
                                        letterSpacing: '-0.02em',
                                        margin: 0
                                    }}>
                                        {devUser?.username}
                                    </h1>
                                    {avail && (
                                        <span style={{
                                            padding: '3px 10px',
                                            borderRadius: 6,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.04em',
                                            backgroundColor: avail.bg,
                                            color: avail.color
                                        }}>
                                            ⬤ {avail.label}
                                        </span>
                                    )}
                                </div>

                                <p style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 13,
                                    color: 'var(--text-muted)',
                                    marginBottom: developer.bio ? 12 : 0
                                }}>
                                    @{developer.githubUsername}
                                </p>

                                {developer.bio && (
                                    <p style={{
                                        fontSize: 14,
                                        color: 'var(--text-secondary)',
                                        lineHeight: 1.65,
                                        marginBottom: 12,
                                        maxWidth: 520
                                    }}>
                                        {developer.bio}
                                    </p>
                                )}

                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                    {developer.location && (
                                        <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                            📍 {developer.location}
                                        </span>
                                    )}
                                    <a
                                        href={`https://github.com/${developer.githubUsername}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            fontSize: 13,
                                            color: 'var(--text-secondary)',
                                            textDecoration: 'none',
                                            transition: 'color 0.15s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    >
                                        <GitHubIcon />
                                        {isMobile ? `@${developer.githubUsername}` : `github.com/${developer.githubUsername}`}
                                    </a>
                                    {developer.lastSyncAt && (
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            Synced {new Date(developer.lastSyncAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scorecard — show inline on mobile (before sidebar) */}
                    {isMobile && (
                        <div style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--accent)',
                            borderRadius: 14,
                            padding: '18px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16
                        }}>
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    fontSize: 10, fontWeight: 600,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    color: 'var(--text-muted)',
                                    marginBottom: 4
                                }}>Reputation Score</p>
                                <p style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 40,
                                    fontWeight: 600,
                                    color: 'var(--accent-text)',
                                    lineHeight: 1,
                                    marginBottom: 4
                                }}>
                                    {Number(developer.score).toFixed(1)}
                                </p>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>time-decayed · out of 500</p>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.min((developer.score / 500) * 100, 100)}%`,
                                        background: 'var(--accent)',
                                        borderRadius: 3,
                                        transition: 'width 0.8s ease'
                                    }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Score breakdown */}
                    {breakdown && (
                        <div style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 14,
                            padding: isMobile ? '18px' : '22px 26px'
                        }}>
                            <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: 6, marginBottom: 20 }}>
                                <p style={{
                                    fontSize: 11, fontWeight: 600,
                                    letterSpacing: '0.07em',
                                    textTransform: 'uppercase',
                                    color: 'var(--text-muted)',
                                    margin: 0
                                }}>
                                    Score Breakdown
                                </p>
                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 12,
                                    color: 'var(--text-muted)'
                                }}>
                                    {breakdown.totalEvents} events · {new Date(breakdown.computedAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {Object.entries(breakdown.breakdown || {}).map(([type, pts]) => (
                                    <div key={type}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                                <span style={{
                                                    width: 9, height: 9,
                                                    borderRadius: '50%',
                                                    background: EVENT_COLORS[type],
                                                    display: 'block',
                                                    flexShrink: 0
                                                }} />
                                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                                    {EVENT_LABELS[type] || type}
                                                </span>
                                            </div>
                                            <span style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: 13,
                                                fontWeight: 500,
                                                color: 'var(--text-primary)'
                                            }}>
                                                {Number(pts).toFixed(1)} pts
                                            </span>
                                        </div>
                                        <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${(pts / maxBreakdown) * 100}%`,
                                                background: EVENT_COLORS[type],
                                                borderRadius: 3,
                                                transition: 'width 0.7s ease'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Activity chart */}
                    {events.length > 0 && (
                        <div style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 14,
                            padding: isMobile ? '18px 16px' : '22px 26px'
                        }}>
                            <p style={{
                                fontSize: 11, fontWeight: 600,
                                letterSpacing: '0.07em',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                marginBottom: 16
                            }}>
                                Activity Timeline
                            </p>
                            <ActivityChart events={events} />
                        </div>
                    )}
                </div>

                {/* Right sidebar — hidden on mobile (scorecard shown inline above) */}
                {!isMobile && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Scorecard */}
                        <div style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--accent)',
                            borderRadius: 14,
                            padding: '22px',
                            textAlign: 'center'
                        }}>
                            <p style={{
                                fontSize: 10, fontWeight: 600,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                marginBottom: 10
                            }}>
                                Reputation Score
                            </p>
                            <p style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 52,
                                fontWeight: 600,
                                color: 'var(--accent-text)',
                                lineHeight: 1,
                                marginBottom: 6
                            }}>
                                {Number(developer.score).toFixed(1)}
                            </p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
                                time-decayed score
                            </p>
                            <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.min((developer.score / 500) * 100, 100)}%`,
                                    background: 'var(--accent)',
                                    borderRadius: 2,
                                    transition: 'width 0.8s ease'
                                }} />
                            </div>
                            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
                                out of 500
                            </p>
                        </div>

                        {/* Skills */}
                        {developer.skills?.length > 0 && (
                            <div style={{
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 14,
                                padding: '18px 20px'
                            }}>
                                <p style={{
                                    fontSize: 10, fontWeight: 600,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    color: 'var(--text-muted)',
                                    marginBottom: 14
                                }}>
                                    Skills ({developer.skills.length})
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {developer.skills.map(skill => (
                                        <span key={skill.tag} style={{
                                            padding: '4px 9px',
                                            borderRadius: 5,
                                            background: 'var(--bg-elevated)',
                                            border: '1px solid var(--border)',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 11,
                                            color: 'var(--text-secondary)',
                                            transition: 'all 0.15s',
                                            cursor: 'default'
                                        }}
                                              onMouseEnter={e => {
                                                  e.currentTarget.style.borderColor = 'var(--accent)'
                                                  e.currentTarget.style.color = 'var(--accent-text)'
                                              }}
                                              onMouseLeave={e => {
                                                  e.currentTarget.style.borderColor = 'var(--border)'
                                                  e.currentTarget.style.color = 'var(--text-secondary)'
                                              }}
                                        >
                                            {skill.tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Leaderboard link */}
                        <Link to="/leaderboard" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 18px',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            textDecoration: 'none',
                            transition: 'border-color 0.15s'
                        }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>▲ View Leaderboard</span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>→</span>
                        </Link>
                    </div>
                )}

                {/* Mobile: Skills + Leaderboard link below main content */}
                {isMobile && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {developer.skills?.length > 0 && (
                            <div style={{
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 14,
                                padding: '18px'
                            }}>
                                <p style={{
                                    fontSize: 10, fontWeight: 600,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    color: 'var(--text-muted)',
                                    marginBottom: 12
                                }}>
                                    Skills ({developer.skills.length})
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {developer.skills.map(skill => (
                                        <span key={skill.tag} style={{
                                            padding: '4px 9px',
                                            borderRadius: 5,
                                            background: 'var(--bg-elevated)',
                                            border: '1px solid var(--border)',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 11,
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {skill.tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <Link to="/leaderboard" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 18px',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            textDecoration: 'none'
                        }}>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>▲ View Leaderboard</span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>→</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Profile