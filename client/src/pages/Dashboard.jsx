import { useEffect, useState } from 'react'
import useAuthStore from '../store/authStore.js'
import useDeveloperStore from '../store/developerStore.js'
import { getMyProfile } from '../api/developer.api.js'
import ScoreCard from '../components/ScoreCard.jsx'
import ActivityChart from '../components/ActivityChart.jsx'

const Dashboard = () => {
    const { user, developer, updateScore } = useAuthStore()
    const { setProfile, setSyncing, isSyncing, updateAfterSync } = useDeveloperStore()
    const [syncResult, setSyncResult] = useState(null)
    const [accessToken, setAccessToken] = useState('')
    const [showTokenInput, setShowTokenInput] = useState(false)

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getMyProfile()
                setProfile(res.data.developer)
            } catch (err) {
                console.error(err)
            }
        }
        fetch()
    }, [])

    const handleSync = async () => {
        if (!accessToken.trim()) {
            setShowTokenInput(true)
            return
        }
        setSyncing(true)
        setSyncResult(null)
        try {
            const { syncGitHub } = await import('../api/developer.api.js')
            const res = await syncGitHub(accessToken)
            const { score, breakdown, ingestion } = res.data
            updateAfterSync(score, breakdown)
            updateScore(score)
            setSyncResult({ score, ingestion })
            setShowTokenInput(false)
        } catch (err) {
            console.error('Sync failed:', err)
        } finally {
            setSyncing(false)
        }
    }

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                    <img
                        src={user?.avatarUrl}
                        alt={user?.username}
                        style={{ width: 48, height: 48, borderRadius: 12, border: '1px solid var(--border)' }}
                    />
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            Hey, {user?.username} 👋
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            {developer?.lastSyncAt
                                ? `Last synced ${new Date(developer.lastSyncAt).toLocaleDateString()}`
                                : 'Never synced — connect your GitHub to get your score'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Sync section */}
            <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '20px 24px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap'
            }}>
                <div>
                    <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3 }}>
                        Sync GitHub Activity
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Pulls your PRs, reviews, commits and recomputes your score
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    {showTokenInput && (
                        <input
                            type="password"
                            placeholder="GitHub personal access token"
                            value={accessToken}
                            onChange={e => setAccessToken(e.target.value)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: 8,
                                border: '1px solid var(--border)',
                                background: 'var(--bg-elevated)',
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 12,
                                outline: 'none',
                                width: 260
                            }}
                            onKeyDown={e => e.key === 'Enter' && handleSync()}
                        />
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
                            transition: 'all 0.15s'
                        }}
                    >
                        {isSyncing ? 'Syncing...' : '↻ Sync GitHub'}
                    </button>
                </div>
            </div>

            {/* Sync result toast */}
            {syncResult && (
                <div style={{
                    backgroundColor: 'var(--green-dim)',
                    border: '1px solid var(--green)',
                    borderRadius: 10,
                    padding: '12px 18px',
                    marginBottom: 24,
                    fontSize: 13,
                    color: 'var(--green)',
                    display: 'flex',
                    gap: 16
                }}>
                    <span>✓ Sync complete</span>
                    <span style={{ color: 'var(--text-secondary)' }}>New score: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{syncResult.score}</strong></span>
                    <span style={{ color: 'var(--text-secondary)' }}>{syncResult.ingestion.newEvents} new events</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{syncResult.ingestion.skillsFound} skills detected</span>
                </div>
            )}

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <ScoreCard
                    title="Reputation Score"
                    value={developer?.score?.toFixed(2) || '—'}
                    sub="time-decayed"
                    accent
                />
                <ScoreCard
                    title="Skills Detected"
                    value={developer?.skills?.length || 0}
                    sub="from GitHub repos"
                />
                <ScoreCard
                    title="Availability"
                    value={developer?.availability || '—'}
                    sub="current status"
                    isStatus
                />
            </div>

            {/* Skills */}
            {developer?.skills?.length > 0 && (
                <div style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: '20px 24px',
                    marginBottom: 24
                }}>
                    <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
                        Detected Skills
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {developer.skills.map(skill => (
                            <span key={skill.tag} style={{
                                padding: '4px 10px',
                                borderRadius: 6,
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 12,
                                color: 'var(--text-secondary)'
                            }}>
                {skill.tag}
              </span>
                        ))}
                    </div>
                </div>
            )}

        </div>
    )
}

export default Dashboard