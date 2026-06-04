const SkillTag = ({ skill, variant = 'default' }) => {
    const variants = {
        default: {
            bg: 'var(--bg-elevated)',
            border: 'var(--border)',
            color: 'var(--text-secondary)'
        },
        highlight: {
            bg: 'var(--accent-dim)',
            border: 'var(--accent)',
            color: 'var(--accent-text)'
        },
        success: {
            bg: 'var(--green-dim)',
            border: 'var(--green)',
            color: 'var(--green)'
        }
    }

    const style = variants[variant] || variants.default

    return (
        <span style={{
            padding: '4px 10px',
            borderRadius: 6,
            background: style.bg,
            border: `1px solid ${style.border}`,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: style.color,
            display: 'inline-block'
        }}>
            {skill}
        </span>
    )
}

export default SkillTag

