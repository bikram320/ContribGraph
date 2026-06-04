import { useState } from 'react'

const SearchFilters = ({ onFilterChange, isLoading }) => {
    const [skills, setSkills] = useState('')
    const [minScore, setMinScore] = useState('')
    const [maxScore, setMaxScore] = useState('')
    const [availability, setAvailability] = useState('')

    const handleSearch = () => {
        onFilterChange({
            skills: skills.trim(),
            minScore: minScore ? parseFloat(minScore) : '',
            maxScore: maxScore ? parseFloat(maxScore) : '',
            availability
        })
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const handleReset = () => {
        setSkills('')
        setMinScore('')
        setMaxScore('')
        setAvailability('')
        onFilterChange({
            skills: '',
            minScore: '',
            maxScore: '',
            availability: ''
        })
    }

    return (
        <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '20px 24px',
            marginBottom: 24
        }}>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
                Filter Developers
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                {/* Skills filter */}
                <input
                    type="text"
                    placeholder="Skills (e.g., react, nodejs, mongodb)"
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13,
                        outline: 'none',
                        transition: 'border 0.15s'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />

                {/* Min Score filter */}
                <input
                    type="number"
                    placeholder="Min Score"
                    value={minScore}
                    onChange={e => setMinScore(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13,
                        outline: 'none',
                        transition: 'border 0.15s'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />

                {/* Max Score filter */}
                <input
                    type="number"
                    placeholder="Max Score"
                    value={maxScore}
                    onChange={e => setMaxScore(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13,
                        outline: 'none',
                        transition: 'border 0.15s'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />

                {/* Availability filter */}
                <select
                    value={availability}
                    onChange={e => setAvailability(e.target.value)}
                    style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13,
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'border 0.15s'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                >
                    <option value="">Any Availability</option>
                    <option value="open">Open to Work</option>
                    <option value="busy">Currently Busy</option>
                    <option value="closed">Not Available</option>
                </select>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                    onClick={handleReset}
                    style={{
                        padding: '9px 18px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        fontWeight: 500,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
                        e.currentTarget.style.color = 'var(--text-primary)'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = 'var(--text-secondary)'
                    }}
                >
                    Reset
                </button>
                <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    style={{
                        padding: '9px 20px',
                        borderRadius: 8,
                        border: 'none',
                        background: isLoading ? 'var(--bg-elevated)' : 'var(--accent)',
                        color: isLoading ? 'var(--text-muted)' : 'var(--bg-base)',
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s'
                    }}
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </div>
        </div>
    )
}

export default SearchFilters

