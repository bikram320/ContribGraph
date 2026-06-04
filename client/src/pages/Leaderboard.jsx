import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const Leaderboard = () => {
    const [developers, setDevelopers] = useState([])
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('all') // 'week', 'month', 'all'
    const [skillFilter, setSkillFilter] = useState('')

    useEffect(() => {
        fetchLeaderboard()
    }, [timeRange, skillFilter])

    const fetchLeaderboard = async () => {
        try {
            setLoading(true)
            // Mock data - In real app, fetch from /api/developers/leaderboard
            const mockDevelopers = [
                {
                    _id: '1',
                    githubUsername: 'torvalds',
                    userId: { username: 'Linus Torvalds', avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4' },
                    score: 985.5,
                    skills: [{ tag: 'C' }, { tag: 'Linux' }, { tag: 'Kernel' }],
                    availability: 'closed',
                    lastSyncAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    githubUsername: 'gvanrossum',
                    userId: { username: 'Guido van Rossum', avatarUrl: 'https://avatars.githubusercontent.com/u/6?v=4' },
                    score: 945.2,
                    skills: [{ tag: 'Python' }, { tag: 'Design' }, { tag: 'Open Source' }],
                    availability: 'busy',
                    lastSyncAt: new Date().toISOString()
                },
                {
                    _id: '3',
                    githubUsername: 'torvalds',
                    userId: { username: 'React Creator', avatarUrl: 'https://avatars.githubusercontent.com/u/810438?v=4' },
                    score: 920.8,
                    skills: [{ tag: 'JavaScript' }, { tag: 'React' }, { tag: 'Web' }],
                    availability: 'open',
                    lastSyncAt: new Date().toISOString()
                }
            ]

            // Filter by skill if provided
            if (skillFilter) {
                setDevelopers(mockDevelopers.filter(dev =>
                    dev.skills.some(s => s.tag.toLowerCase().includes(skillFilter.toLowerCase()))
                ))
            } else {
                setDevelopers(mockDevelopers)
            }
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err)
            toast.error('Failed to load leaderboard')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 8 }}>
                    🏆 Leaderboard
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    Top developers ranked by reputation score
                </p>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: 12,
                marginBottom: 24,
                flexWrap: 'wrap'
            }}>
                {/* Time range filter */}
                <div style={{ display: 'flex', gap: 8 }}>
                    {['week', 'month', 'all'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                border: '1px solid var(--border)',
                                background: timeRange === range ? 'var(--accent)' : 'var(--bg-surface)',
                                color: timeRange === range ? 'var(--bg-base)' : 'var(--text-secondary)',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                textTransform: 'capitalize'
                            }}
                        >
                            {range === 'all' ? 'All Time' : 'This ' + (range === 'week' ? 'Week' : 'Month')}
                        </button>
                    ))}
                </div>

                {/* Skill filter */}
                <input
                    type="text"
                    placeholder="Filter by skill (e.g., React, Python)"
                    value={skillFilter}
                    onChange={e => setSkillFilter(e.target.value)}
                    style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        fontSize: 12,
                        outline: 'none',
                        flex: 1,
                        minWidth: 200
                    }}
                />
            </div>

            {/* Leaderboard Table */}
            {loading ? (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13
                }}>
                    Loading leaderboard...
                </div>
            ) : developers.length > 0 ? (
                <div style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    overflow: 'hidden'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                    }}>
                        <thead>
                            <tr style={{
                                backgroundColor: 'var(--bg-elevated)',
                                borderBottom: '1px solid var(--border)'
                            }}>
                                <th style={{
                                    padding: '14px 20px',
                                    textAlign: 'left',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: 'var(--text-muted)'
                                }}>
                                    Rank
                                </th>
                                <th style={{
                                    padding: '14px 20px',
                                    textAlign: 'left',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: 'var(--text-muted)'
                                }}>
                                    Developer
                                </th>
                                <th style={{
                                    padding: '14px 20px',
                                    textAlign: 'left',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: 'var(--text-muted)'
                                }}>
                                    Score
                                </th>
                                <th style={{
                                    padding: '14px 20px',
                                    textAlign: 'left',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: 'var(--text-muted)'
                                }}>
                                    Skills
                                </th>
                                <th style={{
                                    padding: '14px 20px',
                                    textAlign: 'left',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: 'var(--text-muted)'
                                }}>
                                    Availability
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {developers.map((dev, idx) => (
                                <tr
                                    key={dev._id}
                                    style={{
                                        borderBottom: idx < developers.length - 1 ? '1px solid var(--border)' : 'none',
                                        transition: 'background-color 0.15s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <td style={{
                                        padding: '14px 20px',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: 'var(--text-primary)'
                                    }}>
                                        #{idx + 1}
                                        {idx === 0 && ' 🥇'}
                                        {idx === 1 && ' 🥈'}
                                        {idx === 2 && ' 🥉'}
                                    </td>
                                    <td style={{
                                        padding: '14px 20px',
                                        fontSize: 13
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <img
                                                src={dev.userId?.avatarUrl}
                                                alt={dev.userId?.username}
                                                style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border)' }}
                                            />
                                            <div>
                                                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                                                    {dev.userId?.username}
                                                </p>
                                                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                    @{dev.githubUsername}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{
                                        padding: '14px 20px',
                                        fontSize: 13,
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 600,
                                        color: 'var(--accent-text)'
                                    }}>
                                        {dev.score.toFixed(1)}
                                    </td>
                                    <td style={{
                                        padding: '14px 20px',
                                        fontSize: 12
                                    }}>
                                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                            {dev.skills.slice(0, 3).map(skill => (
                                                <span key={skill.tag} style={{
                                                    padding: '3px 8px',
                                                    borderRadius: 4,
                                                    background: 'var(--accent-dim)',
                                                    color: 'var(--accent-text)',
                                                    fontSize: 11,
                                                    fontWeight: 500
                                                }}>
                                                    {skill.tag}
                                                </span>
                                            ))}
                                            {dev.skills.length > 3 && (
                                                <span style={{
                                                    padding: '3px 8px',
                                                    fontSize: 11,
                                                    color: 'var(--text-muted)'
                                                }}>
                                                    +{dev.skills.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{
                                        padding: '14px 20px',
                                        fontSize: 12
                                    }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: 6,
                                            fontSize: 10,
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            backgroundColor: dev.availability === 'open' ? 'var(--green-dim)' : dev.availability === 'busy' ? 'var(--amber-dim)' : 'var(--red-dim)',
                                            color: dev.availability === 'open' ? 'var(--green)' : dev.availability === 'busy' ? 'var(--amber)' : 'var(--red)'
                                        }}>
                                            {dev.availability === 'open' ? '⬤ Open' : dev.availability === 'busy' ? '⬤ Busy' : '⬤ Closed'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '40px',
                    textAlign: 'center',
                    color: 'var(--text-muted)'
                }}>
                    No developers found with selected filters
                </div>
            )}

        </div>
    )
}

export default Leaderboard

