const STATUS_COLORS = {
    open: 'var(--green)',
    busy: 'var(--amber)',
    closed: 'var(--red)'
}

const ScoreCard = ({ title, value, sub, accent, isStatus }) => {
    const color = isStatus ? (STATUS_COLORS[value] || 'var(--text-secondary)') : accent ? 'var(--accent-text)' : 'var(--text-primary)'

    return (
        <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: `1px solid ${accent ? 'var(--accent-dim)' : 'var(--border)'}`,
            borderRadius: 12,
            padding: '18px 20px',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
                {title}
            </p>
            <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 32,
                fontWeight: 500,
                color,
                lineHeight: 1,
                marginBottom: 6
            }}>
                {value}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</p>
        </div>
    )
}

export default ScoreCard