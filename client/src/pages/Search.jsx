import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { searchDevelopers, saveDeveloper, getSavedDevelopers, removeSavedDeveloper } from '../api/search.api.js'
import toast from 'react-hot-toast'

const useIsMobile = () => {
    const [mobile, setMobile] = useState(() => window.innerWidth < 768)
    useEffect(() => {
        const fn = () => setMobile(window.innerWidth < 768)
        window.addEventListener('resize', fn)
        return () => window.removeEventListener('resize', fn)
    }, [])
    return mobile
}

const Search = () => {
    const isMobile = useIsMobile()
    const [results, setResults] = useState([])
    const [saved, setSaved] = useState([])
    const [loading, setLoading] = useState(false)
    const [tab, setTab] = useState('search') // 'search' | 'saved'
    const [pagination, setPagination] = useState(null)
    const [filters, setFilters] = useState({
        skills: '',
        minScore: '',
        maxScore: '',
        availability: '',
        page: 1
    })

    // load saved list on mount
    useEffect(() => {
        loadSaved()
    }, [])

    const loadSaved = async () => {
        try {
            const res = await getSavedDevelopers()
            setSaved(res.data.saved || [])
        } catch (err) {
            console.error('Failed to load saved:', err)
        }
    }

    const handleSearch = async (e) => {
        e?.preventDefault()
        setLoading(true)
        try {
            const params = {}
            if (filters.skills.trim()) params.skills = filters.skills.trim()
            if (filters.minScore) params.minScore = filters.minScore
            if (filters.maxScore) params.maxScore = filters.maxScore
            if (filters.availability) params.availability = filters.availability
            params.page = filters.page
            params.limit = 10

            const res = await searchDevelopers(params)
            setResults(res.data.developers || [])
            setPagination(res.data.pagination)
        } catch (err) {
            toast.error('Search failed.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (developerId) => {
        try {
            await saveDeveloper(developerId)
            toast.success('Developer saved to shortlist.')
            await loadSaved()
        } catch {
            toast.error('Failed to save.')
        }
    }

    const handleRemove = async (developerId) => {
        try {
            await removeSavedDeveloper(developerId)
            toast.success('Removed from shortlist.')
            await loadSaved()
        } catch {
            toast.error('Failed to remove.')
        }
    }

    const isSaved = (devId) => saved.some(s => s._id === devId)

    const availabilityColor = {
        open: { bg: 'var(--green-dim)', color: 'var(--green)' },
        busy: { bg: 'var(--amber-dim)', color: 'var(--amber)' },
        closed: { bg: 'var(--red-dim)', color: 'var(--red)' }
    }

    const DeveloperCard = ({ dev, onSave, onRemove, saved }) => (
        <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: isMobile ? '16px' : '20px 22px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? 12 : 16,
            transition: 'border-color 0.15s'
        }}
             onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
             onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
            {/* Avatar + Info + Score row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                {/* Avatar */}
                {dev.userId?.avatarUrl ? (
                    <img
                        src={dev.userId.avatarUrl}
                        alt={dev.githubUsername}
                        style={{ width: 48, height: 48, borderRadius: 12, border: '1px solid var(--border)', flexShrink: 0 }}
                    />
                ) : (
                    <div style={{
                        width: 48, height: 48,
                        borderRadius: 12,
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, flexShrink: 0
                    }}>
                        🧑‍💻
                    </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <Link
                            to={`/profile/${dev.githubUsername}`}
                            style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                        >
                            {dev.userId?.username || dev.githubUsername}
                        </Link>
                        {dev.availability && (
                            <span style={{
                                padding: '2px 8px',
                                borderRadius: 5,
                                fontSize: 11,
                                fontWeight: 600,
                                backgroundColor: availabilityColor[dev.availability]?.bg,
                                color: availabilityColor[dev.availability]?.color
                            }}>
              {dev.availability === 'open' ? '⬤ Open' : dev.availability === 'busy' ? '⬤ Busy' : '⬤ Closed'}
            </span>
                        )}
                    </div>

                    {/* Skills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {dev.skills?.slice(0, 5).map(s => (
                            <span key={s.tag} style={{
                                padding: '2px 7px',
                                borderRadius: 4,
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 11,
                                color: 'var(--text-muted)'
                            }}>
              {s.tag}
            </span>
                        ))}
                        {dev.skills?.length > 5 && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '2px 4px' }}>
              +{dev.skills.length - 5} more
            </span>
                        )}
                    </div>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 22,
                        fontWeight: 600,
                        color: 'var(--accent-text)',
                        lineHeight: 1,
                        marginBottom: 3
                    }}>
                        {Number(dev.score).toFixed(1)}
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        score
                    </p>
                </div>
            </div>{/* end avatar+info+score row */}

            {/* Action */}
            <button
                onClick={() => saved ? onRemove(dev._id) : onSave(dev._id)}
                style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: `1px solid ${saved ? 'var(--red)' : 'var(--accent)'}`,
                    background: saved ? 'var(--red-dim)' : 'var(--accent-dim)',
                    color: saved ? 'var(--red)' : 'var(--accent-text)',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                    width: isMobile ? '100%' : 'auto'
                }}
            >
                {saved ? '− Remove' : '+ Save'}
            </button>
        </div>
    )

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 16px' : '32px 24px' }}>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-text)', marginBottom: 8 }}>
                    Recruiter
                </p>
                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 32,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    marginBottom: 6
                }}>
                    Find Developers
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    Search by skill, score range, and availability. All profiles are backed by real GitHub activity.
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
                {[
                    { key: 'search', label: 'Search' },
                    { key: 'saved', label: `Saved (${saved.length})` }
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{
                        padding: '10px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: `2px solid ${tab === t.key ? 'var(--accent)' : 'transparent'}`,
                        color: tab === t.key ? 'var(--accent-text)' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 14,
                        fontWeight: tab === t.key ? 600 : 400,
                        cursor: 'pointer',
                        marginBottom: -1,
                        transition: 'all 0.15s'
                    }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Search tab */}
            {tab === 'search' && (
                <>
                    {/* Filter form */}
                    <form onSubmit={handleSearch} style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 14,
                        padding: '20px 24px',
                        marginBottom: 20
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>
                                    Skills
                                </label>
                                <input
                                    type="text"
                                    placeholder="react, nodejs, python..."
                                    value={filters.skills}
                                    onChange={e => setFilters(f => ({ ...f, skills: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '9px 14px',
                                        borderRadius: 8,
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg-elevated)',
                                        color: 'var(--text-primary)',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: 13,
                                        outline: 'none'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>
                                    Availability
                                </label>
                                <select
                                    value={filters.availability}
                                    onChange={e => setFilters(f => ({ ...f, availability: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '9px 14px',
                                        borderRadius: 8,
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg-elevated)',
                                        color: 'var(--text-primary)',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: 13,
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="">Any availability</option>
                                    <option value="open">Open to Work</option>
                                    <option value="busy">Busy</option>
                                    <option value="closed">Not Available</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>
                                    Min Score
                                </label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={filters.minScore}
                                    onChange={e => setFilters(f => ({ ...f, minScore: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '9px 14px',
                                        borderRadius: 8,
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg-elevated)',
                                        color: 'var(--text-primary)',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 13,
                                        outline: 'none'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>
                                    Max Score
                                </label>
                                <input
                                    type="number"
                                    placeholder="9999"
                                    value={filters.maxScore}
                                    onChange={e => setFilters(f => ({ ...f, maxScore: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '9px 14px',
                                        borderRadius: 8,
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg-elevated)',
                                        color: 'var(--text-primary)',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 13,
                                        outline: 'none'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap' }}>
                            <button type="submit" disabled={loading} style={{
                                padding: '9px 24px',
                                borderRadius: 8,
                                border: 'none',
                                background: loading ? 'var(--bg-elevated)' : 'var(--accent)',
                                color: loading ? 'var(--text-muted)' : 'var(--bg-base)',
                                fontWeight: 600,
                                fontSize: 13,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontFamily: 'var(--font-sans)',
                                transition: 'all 0.15s'
                            }}>
                                {loading ? 'Searching...' : 'Search Developers'}
                            </button>
                            <button type="button" onClick={() => {
                                setFilters({ skills: '', minScore: '', maxScore: '', availability: '', page: 1 })
                                setResults([])
                                setPagination(null)
                            }} style={{
                                padding: '9px 16px',
                                borderRadius: 8,
                                border: '1px solid var(--border)',
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                                fontSize: 13,
                                cursor: 'pointer',
                                fontFamily: 'var(--font-sans)'
                            }}>
                                Clear
                            </button>
                            {pagination && (
                                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
                  {pagination.total} developer{pagination.total !== 1 ? 's' : ''} found
                </span>
                            )}
                        </div>
                    </form>

                    {/* Results */}
                    {results.length === 0 && !loading && pagination && (
                        <div style={{
                            textAlign: 'center',
                            padding: '48px 24px',
                            color: 'var(--text-muted)',
                            fontSize: 14
                        }}>
                            No developers matched your filters.
                        </div>
                    )}

                    {results.length === 0 && !loading && !pagination && (
                        <div style={{
                            textAlign: 'center',
                            padding: '48px 24px',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 14,
                            color: 'var(--text-muted)',
                            fontSize: 14
                        }}>
                            <p style={{ marginBottom: 8 }}>Search for developers above.</p>
                            <p style={{ fontSize: 12 }}>Filter by skill (e.g. "react"), minimum score, or availability status.</p>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {results.map(dev => (
                            <DeveloperCard
                                key={dev._id}
                                dev={dev}
                                saved={isSaved(dev._id)}
                                onSave={handleSave}
                                onRemove={handleRemove}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                            <button
                                onClick={() => {
                                    setFilters(f => ({ ...f, page: f.page - 1 }))
                                    handleSearch()
                                }}
                                disabled={pagination.page <= 1}
                                style={{
                                    padding: '7px 16px',
                                    borderRadius: 8,
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: pagination.page <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                                    cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                                    fontSize: 13,
                                    fontFamily: 'var(--font-sans)'
                                }}
                            >
                                ← Prev
                            </button>
                            <span style={{ padding: '7px 14px', fontSize: 13, color: 'var(--text-muted)' }}>
                Page {pagination.page} of {pagination.pages}
              </span>
                            <button
                                onClick={() => {
                                    setFilters(f => ({ ...f, page: f.page + 1 }))
                                    handleSearch()
                                }}
                                disabled={pagination.page >= pagination.pages}
                                style={{
                                    padding: '7px 16px',
                                    borderRadius: 8,
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: pagination.page >= pagination.pages ? 'var(--text-muted)' : 'var(--text-primary)',
                                    cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer',
                                    fontSize: 13,
                                    fontFamily: 'var(--font-sans)'
                                }}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Saved tab */}
            {tab === 'saved' && (
                <>
                    {saved.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '48px 24px',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 14
                        }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>Your shortlist is empty.</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                Search for developers and click "+ Save" to add them here.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {saved.map(dev => (
                                <DeveloperCard
                                    key={dev._id}
                                    dev={dev}
                                    saved={true}
                                    onSave={handleSave}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Search