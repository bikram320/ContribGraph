import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'

const MEDAL = { 0: '🥇', 1: '🥈', 2: '🥉' }

const Leaderboard = () => {
    const [developers, setDevelopers] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                // uses the public search endpoint — no auth needed
                // sorted by score descending by default
                const res = await api.get('/search/developers', {
                    params: { limit: 20, page: 1 }
                })
                setDevelopers(res.data.developers || [])
            } catch (err) {
                console.error('Leaderboard fetch failed:', err)
                setDevelopers([])
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filtered = filter === 'all'
        ? developers
        : developers.filter(d => d.availability === filter)

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-text)', marginBottom: 8 }}>
                    Community
                </p>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 8 }}>
                    Developer Leaderboard
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    Ranked by time-decayed reputation score. Updated on every sync.
                </p>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                {[
                    { val: 'all', label: 'All Developers' },
                    { val: 'open', label: '🟢 Open to Work' },
                    { val: 'busy', label: '🟡 Busy' }
                ].map(opt => (
                    <button key={opt.val} onClick={() => setFilter(opt.val)} style={{
                        padding: '7px 16px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 500,
                        border: `1px solid ${filter === opt.val ? 'var(--accent)' : 'var(--border)'}`,
                        background: filter === opt.val ? 'var(--accent-dim)' : 'transparent',
                        color: filter === opt.val ? 'var(--accent-text)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                    }}>
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                overflow: 'hidden'
            }}>

                {/* Table header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '48px 1fr 120px 80px',
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-elevated)'
                }}>
                    {['Rank', 'Developer', 'Skills', 'Score'].map(h => (
                        <span key={h} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              {h}
            </span>
                    ))}
                </div>

                {loading ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                        loading leaderboard...
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No developers found.</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>Be the first — sync your GitHub on the dashboard.</p>
                    </div>
                ) : (
                    filtered.map((dev, i) => (
                        <Link
                            key={dev._id}
                            to={`/profile/${dev.githubUsername}`}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '48px 1fr 120px 80px',
                                padding: '14px 20px',
                                borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                textDecoration: 'none',
                                alignItems: 'center',
                                transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {/* Rank */}
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: i < 3 ? 18 : 13,
                                color: i < 3 ? 'var(--text-primary)' : 'var(--text-muted)',
                                fontWeight: 600
                            }}>
                {MEDAL[i] || `#${i + 1}`}
              </span>

                            {/* Developer */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {dev.userId?.avatarUrl && (
                                    <img
                                        src={dev.userId.avatarUrl}
                                        alt={dev.githubUsername}
                                        style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', flexShrink: 0 }}
                                    />
                                )}
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                                        {dev.userId?.username || dev.githubUsername}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '1px 6px',
                        borderRadius: 4,
                        backgroundColor: dev.availability === 'open' ? 'var(--green-dim)' : dev.availability === 'busy' ? 'var(--amber-dim)' : 'var(--bg-elevated)',
                        color: dev.availability === 'open' ? 'var(--green)' : dev.availability === 'busy' ? 'var(--amber)' : 'var(--text-muted)',
                    }}>
                      {dev.availability}
                    </span>
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {dev.skills?.slice(0, 2).map(s => (
                                    <span key={s.tag} style={{
                                        padding: '2px 6px',
                                        borderRadius: 4,
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border)',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 10,
                                        color: 'var(--text-muted)'
                                    }}>
                    {s.tag}
                  </span>
                                ))}
                                {dev.skills?.length > 2 && (
                                    <span style={{ fontSize: 10, color: 'var(--text-muted)', padding: '2px 4px' }}>
                    +{dev.skills.length - 2}
                  </span>
                                )}
                            </div>

                            {/* Score */}
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 16,
                                fontWeight: 600,
                                color: i === 0 ? 'var(--accent-text)' : 'var(--text-primary)'
                            }}>
                {Number(dev.score).toFixed(1)}
              </span>
                        </Link>
                    ))
                )}
            </div>

            {/* Empty state helper */}
            {!loading && developers.length === 0 && (
                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 24 }}>
                    The leaderboard fills up as developers sync their GitHub. Go to your dashboard and sync first.
                </p>
            )}
        </div>
    )
}

export default Leaderboard