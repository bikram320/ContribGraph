import { useEffect, useState } from 'react'
import useAuthStore from '../store/authStore.js'
import useDeveloperStore from '../store/developerStore.js'
import { getMyProfile, getMyEvents, updateAvailability, syncGitHub } from '../api/developer.api.js'
import ScoreCard from '../components/ScoreCard.jsx'
import ActivityChart from '../components/ActivityChart.jsx'
import toast from 'react-hot-toast'

const EVENT_LABELS = {
    pr_merged: 'Merged PR',
    review: 'Code Review',
    issue_closed: 'Issue Closed',
    push: 'Push',
    comment: 'Comment'
}

const EVENT_COLORS = {
    pr_merged: 'var(--accent)',
    review: 'var(--green)',
    issue_closed: 'var(--amber)',
    push: 'var(--indigo)',
    comment: 'var(--text-muted)'
}

const Dashboard = () => {
    const { user, developer, updateScore, setDeveloper } = useAuthStore()
    const { setProfile, setSyncing, isSyncing, updateAfterSync, events, setEvents, scoreBreakdown, setScoreBreakdown } = useDeveloperStore()
    const [syncResult, setSyncResult] = useState(null)
    const [accessToken, setAccessToken] = useState('')
    const [showTokenInput, setShowTokenInput] = useState(false)
    const [updatingAvailability, setUpdatingAvailability] = useState(false)

    useEffect(() => {
        // Step 1: read token from URL FIRST, before any API calls
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')
        if (token) {
            localStorage.setItem('contribgraph-jwt', token)
            window.history.replaceState({}, '', '/dashboard')
        }

        // Step 2: now fetch profile (token is already in localStorage)
        const load = async () => {
            try {
                const res = await getMyProfile()
                setProfile(res.data.developer)
            } catch (err) {
                console.error(err)
            }
            try {
                const eventsRes = await getMyEvents()
                setEvents(eventsRes.data.events || [])
            } catch (err) {
                console.error('Events fetch failed:', err)
            }
        }
        load()
    }, [])

    const handleSync = async () => {
        if (!accessToken.trim()) {
            setShowTokenInput(true)
            return
        }
        setSyncing(true)
        setSyncResult(null)
        try {
            const res = await syncGitHub(accessToken)
            const { score, breakdown, ingestion } = res.data
            updateAfterSync(score, breakdown)
            updateScore(score)
            setScoreBreakdown(breakdown)
            setSyncResult({ score, ingestion })
            setShowTokenInput(false)
            toast.success('GitHub sync complete!')
            const eventsRes = await getMyEvents()
            setEvents(eventsRes.data.events || [])
        } catch (err) {
            toast.error('Sync failed. Check your token and try again.')
            console.error('Sync failed:', err)
        } finally {
            setSyncing(false)
        }
    }

    const handleAvailability = async (newVal) => {
        setUpdatingAvailability(true)
        try {
            await updateAvailability(newVal)
            setDeveloper({ ...developer, availability: newVal })
            toast.success(`Availability set to "${newVal}"`)
        } catch {
            toast.error('Failed to update availability')
        } finally {
            setUpdatingAvailability(false)
        }
    }

    const availabilityOptions = [
        { val: 'open', label: 'Open to Work', color: 'var(--green)', dim: 'var(--green-dim)' },
        { val: 'busy', label: 'Busy', color: 'var(--amber)', dim: 'var(--amber-dim)' },
        { val: 'closed', label: 'Not Available', color: 'var(--red)', dim: 'var(--red-dim)' }
    ]

    const breakdownData = scoreBreakdown || {}
    const maxBreakdown = Math.max(...Object.values(breakdownData), 1)

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
                .dashboard-header { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
                .dashboard-main { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }
                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
                .sync-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
                .sync-btns { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
                .token-input { width: 240px; }
                @media (max-width: 900px) {
                    .dashboard-main { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 600px) {
                    .stats-grid { grid-template-columns: 1fr 1fr !important; }
                    .dashboard-header { gap: 12px; }
                    .sync-row { flex-direction: column; align-items: flex-start; }
                    .sync-btns { width: 100%; }
                    .token-input { width: 100% !important; }
                    .event-repo { display: none !important; }
                }
            `}</style>

            {/* Header */}
            <div className="dashboard-header">
                <img
                    src={user?.avatarUrl}
                    alt={user?.username}
                    style={{ width: 52, height: 52, borderRadius: 14, border: '2px solid var(--border)', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 3 }}>
                        Hey, {user?.username} 👋
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {developer?.lastSyncAt
                            ? `Last synced ${new Date(developer.lastSyncAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                            : 'Sync your GitHub to generate your score'}
                    </p>
                </div>
                <span style={{
                    padding: '4px 12px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--accent)',
                    color: 'var(--accent-text)',
                    flexShrink: 0
                }}>
                    {user?.role}
                </span>
            </div>

            {/* Sync banner */}
            <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '18px 20px',
                marginBottom: 20,
            }}>
                <div className="sync-row">
                    <div>
                        <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3, fontSize: 14 }}>
                            Sync GitHub Activity
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Requires a GitHub token with{' '}
                            <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: 4 }}>repo</code>{' '}
                            and{' '}
                            <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: 4 }}>read:user</code>{' '}
                            scopes
                        </p>
                    </div>
                    <div className="sync-btns">
                        {showTokenInput && (
                            <input
                                type="password"
                                className="token-input"
                                placeholder="ghp_xxxxxxxxxxxx"
                                value={accessToken}
                                onChange={e => setAccessToken(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSync()}
                                autoFocus
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: 8,
                                    border: '1px solid var(--accent)',
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 12,
                                    outline: 'none',
                                }}
                            />
                        )}
                        {showTokenInput && (
                            <button
                                onClick={() => { setShowTokenInput(false); setAccessToken('') }}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: 13
                                }}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            style={{
                                padding: '9px 20px',
                                borderRadius: 8,
                                border: 'none',
                                background: isSyncing ? 'var(--bg-elevated)' : 'var(--accent)',
                                color: isSyncing ? 'var(--text-muted)' : 'var(--bg-base)',
                                fontWeight: 600,
                                fontSize: 13,
                                cursor: isSyncing ? 'not-allowed' : 'pointer',
                                fontFamily: 'var(--font-sans)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 7,
                                transition: 'all 0.15s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <span style={{ display: 'inline-block', animation: isSyncing ? 'spin 1s linear infinite' : 'none' }}>↻</span>
                            {isSyncing ? 'Syncing...' : 'Sync GitHub'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Sync success banner */}
            {syncResult && (
                <div style={{
                    background: 'var(--green-dim)',
                    border: '1px solid var(--green)',
                    borderRadius: 10,
                    padding: '12px 18px',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap',
                    fontSize: 13
                }}>
                    <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ Sync complete</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Score: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{Number(syncResult.score).toFixed(2)}</strong></span>
                    <span style={{ color: 'var(--text-secondary)' }}>{syncResult.ingestion.newEvents} new events</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{syncResult.ingestion.skillsFound} skills detected</span>
                    <button onClick={() => setSyncResult(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>×</button>
                </div>
            )}

            {/* Main two-column layout */}
            <div className="dashboard-main">

                {/* Left column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Stats row */}
                    <div className="stats-grid">
                        <ScoreCard title="Reputation Score" value={developer?.score?.toFixed(2) || '—'} sub="time-decayed" accent />
                        <ScoreCard title="Skills Detected" value={developer?.skills?.length || 0} sub="from GitHub repos" />
                        <ScoreCard title="Total Events" value={events?.length || 0} sub="contributions tracked" />
                    </div>

                    {/* Score breakdown */}
                    {Object.keys(breakdownData).length > 0 && (
                        <div style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 14,
                            padding: '20px 22px'
                        }}>
                            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 18 }}>
                                Score Breakdown
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {Object.entries(breakdownData).map(([type, pts]) => (
                                    <div key={type}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: EVENT_COLORS[type], flexShrink: 0, display: 'block' }} />
                                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{EVENT_LABELS[type] || type}</span>
                                            </div>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)' }}>
                                                {Number(pts).toFixed(1)}
                                            </span>
                                        </div>
                                        <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${(pts / maxBreakdown) * 100}%`,
                                                background: EVENT_COLORS[type],
                                                borderRadius: 3,
                                                transition: 'width 0.6s ease'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Activity chart */}
                    {events?.length > 0 && (
                        <div style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 14,
                            padding: '20px 22px'
                        }}>
                            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
                                Activity Timeline
                            </p>
                            <ActivityChart events={events} />
                        </div>
                    )}

                    {/* Recent events */}
                    {events?.length > 0 && (
                        <div style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 14,
                            padding: '20px 22px'
                        }}>
                            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
                                Recent Activity
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {events.slice(0, 8).map((event, i) => (
                                    <div key={event._id || i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '10px 0',
                                        borderBottom: i < 7 ? '1px solid var(--border-subtle)' : 'none'
                                    }}>
                                        <span style={{
                                            width: 8, height: 8,
                                            borderRadius: '50%',
                                            background: EVENT_COLORS[event.type],
                                            flexShrink: 0
                                        }} />
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>
                                            {EVENT_LABELS[event.type]}
                                        </span>
                                        <span className="event-repo" style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 11,
                                            color: 'var(--text-muted)',
                                            maxWidth: 160,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {event.repoName}
                                        </span>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                                            {new Date(event.occurredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                        <span style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 11,
                                            color: EVENT_COLORS[event.type],
                                            flexShrink: 0,
                                            fontWeight: 500
                                        }}>
                                            +{event.weight}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right column — sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Availability toggle */}
                    <div style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 14,
                        padding: '18px 20px'
                    }}>
                        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
                            Availability
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {availabilityOptions.map(opt => (
                                <button
                                    key={opt.val}
                                    onClick={() => handleAvailability(opt.val)}
                                    disabled={updatingAvailability || developer?.availability === opt.val}
                                    style={{
                                        padding: '10px 14px',
                                        borderRadius: 9,
                                        border: `1px solid ${developer?.availability === opt.val ? opt.color : 'var(--border)'}`,
                                        background: developer?.availability === opt.val ? opt.dim : 'transparent',
                                        color: developer?.availability === opt.val ? opt.color : 'var(--text-secondary)',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: 13,
                                        fontWeight: developer?.availability === opt.val ? 600 : 400,
                                        cursor: developer?.availability === opt.val ? 'default' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        transition: 'all 0.15s',
                                        textAlign: 'left'
                                    }}
                                >
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                                    {opt.label}
                                    {developer?.availability === opt.val && (
                                        <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.7 }}>active</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Skills */}
                    {developer?.skills?.length > 0 && (
                        <div style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 14,
                            padding: '18px 20px'
                        }}>
                            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
                                Detected Skills
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {developer.skills.map(skill => (
                                    <span key={skill.tag} style={{
                                        padding: '4px 9px',
                                        borderRadius: 6,
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

                    {/* Quick links */}
                    <div style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 14,
                        padding: '18px 20px'
                    }}>
                        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
                            Quick Links
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { label: '↗ View Public Profile', to: `/profile/${user?.username}` },
                                { label: '⬆ Leaderboard', to: '/leaderboard' },
                                { label: '⬡ GitHub Profile', href: `https://github.com/${user?.username}` }
                            ].map(link => (
                                link.href ? (
                                    <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                                       style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', padding: '6px 0', transition: 'color 0.15s' }}
                                       onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
                                       onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    >{link.label}</a>
                                ) : (
                                    <a key={link.label} href={link.to}
                                       style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', padding: '6px 0', transition: 'color 0.15s' }}
                                       onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
                                       onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    >{link.label}</a>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard