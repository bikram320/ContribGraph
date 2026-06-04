import { useEffect, useState } from 'react'
import { searchDevelopers, saveDeveloper, removeSavedDeveloper, getSavedDevelopers } from '../api/search.api.js'
import SearchFilters from '../components/SearchFilters.jsx'
import SkillTag from '../components/SkillTag.jsx'
import toast from 'react-hot-toast'

const Search = () => {
    const [developers, setDevelopers] = useState([])
    const [savedIds, setSavedIds] = useState(new Set())
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState(null)
    const [filters, setFilters] = useState({
        skills: '',
        minScore: '',
        maxScore: '',
        availability: ''
    })
    const [hasSearched, setHasSearched] = useState(false)

    // Load saved developers on mount
    useEffect(() => {
        loadSavedDevelopers()
    }, [])

    const loadSavedDevelopers = async () => {
        try {
            const res = await getSavedDevelopers()
            const ids = new Set(res.data.saved.map(dev => dev._id))
            setSavedIds(ids)
        } catch (err) {
            console.error('Failed to load saved developers:', err)
        }
    }

    const handleFilterChange = async (newFilters) => {
        setFilters(newFilters)
        await performSearch(newFilters, 1)
    }

    const performSearch = async (searchFilters, page = 1) => {
        try {
            setLoading(true)
            setHasSearched(true)

            const params = {
                page,
                limit: 10
            }

            if (searchFilters.skills) params.skills = searchFilters.skills
            if (searchFilters.minScore) params.minScore = searchFilters.minScore
            if (searchFilters.maxScore) params.maxScore = searchFilters.maxScore
            if (searchFilters.availability) params.availability = searchFilters.availability

            const res = await searchDevelopers(params)
            setDevelopers(res.data.developers || [])
            setPagination(res.data.pagination)
        } catch (err) {
            console.error('Search failed:', err)
            toast.error(err.response?.data?.message || 'Search failed')
            setDevelopers([])
        } finally {
            setLoading(false)
        }
    }

    const handleSaveDeveloper = async (developerId) => {
        try {
            await saveDeveloper(developerId)
            setSavedIds(prev => new Set([...prev, developerId]))
            toast.success('Developer saved to shortlist')
        } catch (err) {
            console.error('Failed to save developer:', err)
            toast.error(err.response?.data?.message || 'Failed to save developer')
        }
    }

    const handleRemoveSavedDeveloper = async (developerId) => {
        try {
            await removeSavedDeveloper(developerId)
            setSavedIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(developerId)
                return newSet
            })
            toast.success('Developer removed from shortlist')
        } catch (err) {
            console.error('Failed to remove developer:', err)
            toast.error(err.response?.data?.message || 'Failed to remove developer')
        }
    }

    const handlePageChange = (newPage) => {
        performSearch(filters, newPage)
    }

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 8 }}>
                    Find Developers
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    Search by skills, score, and availability. Save developers to your shortlist.
                </p>
            </div>

            {/* Search Filters */}
            <SearchFilters onFilterChange={handleFilterChange} isLoading={loading} />

            {/* Results */}
            {hasSearched && (
                <>
                    {developers.length > 0 ? (
                        <>
                            <div style={{ marginBottom: 16 }}>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    Found <strong style={{ color: 'var(--text-primary)' }}>{pagination?.total || 0}</strong> developer{pagination?.total !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {/* Developer cards grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 24 }}>
                                {developers.map(dev => (
                                    <div key={dev._id} style={{
                                        backgroundColor: 'var(--bg-surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 12,
                                        padding: '18px 20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.15s'
                                    }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = 'var(--accent)'
                                            e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = 'var(--border)'
                                            e.currentTarget.style.boxShadow = 'none'
                                        }}
                                    >
                                        {/* Header */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                                            <img
                                                src={dev.userId?.avatarUrl}
                                                alt={dev.userId?.username}
                                                style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid var(--border)' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                                                    {dev.userId?.username}
                                                </p>
                                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                    @{dev.githubUsername}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => savedIds.has(dev._id)
                                                    ? handleRemoveSavedDeveloper(dev._id)
                                                    : handleSaveDeveloper(dev._id)
                                                }
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 8,
                                                    border: '1px solid var(--border)',
                                                    background: savedIds.has(dev._id) ? 'var(--accent)' : 'var(--bg-elevated)',
                                                    color: savedIds.has(dev._id) ? 'var(--bg-base)' : 'var(--text-secondary)',
                                                    fontSize: 16,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s'
                                                }}
                                                title={savedIds.has(dev._id) ? 'Remove from shortlist' : 'Add to shortlist'}
                                            >
                                                {savedIds.has(dev._id) ? '★' : '☆'}
                                            </button>
                                        </div>

                                        {/* Score and availability */}
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: 6,
                                                background: 'var(--accent-dim)',
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: 12,
                                                fontWeight: 600,
                                                color: 'var(--accent-text)'
                                            }}>
                                                {dev.score?.toFixed(1) || '0'} pts
                                            </span>
                                            {dev.availability && (
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: 6,
                                                    fontSize: 10,
                                                    fontWeight: 500,
                                                    textTransform: 'uppercase',
                                                    backgroundColor: dev.availability === 'open' ? 'var(--green-dim)' : dev.availability === 'busy' ? 'var(--amber-dim)' : 'var(--red-dim)',
                                                    color: dev.availability === 'open' ? 'var(--green)' : dev.availability === 'busy' ? 'var(--amber)' : 'var(--red)'
                                                }}>
                                                    {dev.availability === 'open' ? '⬤ Open' : dev.availability === 'busy' ? '⬤ Busy' : '⬤ Closed'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Skills */}
                                        {dev.skills && dev.skills.length > 0 && (
                                            <div style={{ marginBottom: 12 }}>
                                                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>
                                                    Skills ({dev.skills.length})
                                                </p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                                    {dev.skills.slice(0, 5).map(skill => (
                                                        <SkillTag key={skill.tag} skill={skill.tag} variant="highlight" />
                                                    ))}
                                                    {dev.skills.length > 5 && (
                                                        <span style={{
                                                            padding: '4px 8px',
                                                            borderRadius: 6,
                                                            fontSize: 11,
                                                            color: 'var(--text-muted)',
                                                            fontWeight: 500
                                                        }}>
                                                            +{dev.skills.length - 5} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Last sync */}
                                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                            Last synced {dev.lastSyncAt ? new Date(dev.lastSyncAt).toLocaleDateString() : 'never'}
                                        </p>

                                        {/* View profile link */}
                                        <a
                                            href={`/profile/${dev.githubUsername}`}
                                            style={{
                                                marginTop: 12,
                                                padding: '8px 12px',
                                                borderRadius: 8,
                                                border: '1px solid var(--border)',
                                                background: 'var(--bg-elevated)',
                                                color: 'var(--text-secondary)',
                                                textDecoration: 'none',
                                                fontSize: 12,
                                                fontWeight: 500,
                                                textAlign: 'center',
                                                transition: 'all 0.15s',
                                                cursor: 'pointer'
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
                                            View Profile →
                                        </a>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.pages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 24 }}>
                                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            disabled={page === pagination.page}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: 8,
                                                border: '1px solid var(--border)',
                                                background: page === pagination.page ? 'var(--accent)' : 'var(--bg-surface)',
                                                color: page === pagination.page ? 'var(--bg-base)' : 'var(--text-secondary)',
                                                fontWeight: 500,
                                                fontSize: 12,
                                                cursor: page === pagination.page ? 'default' : 'pointer',
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            padding: '32px 24px',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                                No developers found matching your criteria. Try adjusting your filters.
                            </p>
                        </div>
                    )}
                </>
            )}

        </div>
    )
}

export default Search

