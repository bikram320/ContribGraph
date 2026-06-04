import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicProfile } from '../api/developer.api.js'
import ScoreCard from '../components/ScoreCard.jsx'
import toast from 'react-hot-toast'

const Profile = () => {
    const { username } = useParams()
    const [developer, setDeveloper] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true)
                const res = await getPublicProfile(username)
                setDeveloper(res.data.developer)
                setError(null)
            } catch (err) {
                console.error('Failed to fetch profile:', err)
                setError(err.response?.data?.message || 'Failed to load profile')
                toast.error('Failed to load profile')
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [username])

    if (loading) {
        return (
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
                <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Loading profile...</p>
            </div>
        )
    }

    if (error || !developer) {
        return (
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
                <div style={{
                    backgroundColor: 'var(--red-dim)',
                    border: '1px solid var(--red)',
                    borderRadius: 10,
                    padding: '16px 20px',
                    color: 'var(--red)',
                    fontSize: 13
                }}>
                    ✗ {error || 'Developer not found'}
                </div>
            </div>
        )
    }

    const user = developer.userId

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                    <img
                        src={user?.avatarUrl}
                        alt={user?.username}
                        style={{ width: 80, height: 80, borderRadius: 16, border: '2px solid var(--accent-dim)' }}
                    />
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
                            {user?.username}
                        </h1>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                            @{developer.githubUsername}
                        </p>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            {developer.availability && (
                                <span style={{
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    backgroundColor: developer.availability === 'open' ? 'var(--green-dim)' : developer.availability === 'busy' ? 'var(--amber-dim)' : 'var(--red-dim)',
                                    color: developer.availability === 'open' ? 'var(--green)' : developer.availability === 'busy' ? 'var(--amber)' : 'var(--red)'
                                }}>
                                    {developer.availability === 'open' ? '⬤ Open to Work' : developer.availability === 'busy' ? '⬤ Currently Busy' : '⬤ Not Available'}
                                </span>
                            )}
                            {developer.lastSyncAt && (
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    Last synced {new Date(developer.lastSyncAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <ScoreCard
                    title="Reputation Score"
                    value={developer.score?.toFixed(2) || '—'}
                    sub="time-decayed"
                    accent
                />
                <ScoreCard
                    title="Skills Detected"
                    value={developer.skills?.length || 0}
                    sub="from GitHub repos"
                />
                <ScoreCard
                    title="Repositories"
                    value={developer.totalRepos || '—'}
                    sub="analyzed"
                />
            </div>

            {/* Skills */}
            {developer.skills && developer.skills.length > 0 && (
                <div style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: '20px 24px',
                    marginBottom: 24
                }}>
                    <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
                        Detected Skills ({developer.skills.length})
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {developer.skills.map(skill => (
                            <span key={skill.tag} style={{
                                padding: '6px 12px',
                                borderRadius: 8,
                                background: 'var(--accent-dim)',
                                border: '1px solid var(--accent)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 12,
                                fontWeight: 500,
                                color: 'var(--accent-text)'
                            }}>
                                {skill.tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* GitHub Link */}
            <div style={{ marginTop: 32 }}>
                <a
                    href={`https://github.com/${developer.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 16px',
                        borderRadius: 10,
                        backgroundColor: 'var(--accent)',
                        color: 'var(--bg-base)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: 13,
                        transition: 'opacity 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                    View on GitHub
                </a>
            </div>

        </div>
    )
}

export default Profile