import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import useAuth from '../hooks/useAuth.js'

const Login = () => {
    const { isAuthenticated } = useAuthStore()
    const { fetchMe } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        // if user lands here after OAuth redirect, fetch their data
        fetchMe().then(() => {
            if (useAuthStore.getState().isAuthenticated) {
                navigate('/dashboard')
            }
        })
    }, [])

    useEffect(() => {
        if (isAuthenticated) navigate('/dashboard')
    }, [isAuthenticated])

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--bg-base)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24
        }}>
            <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>

                {/* Logo */}
                <div style={{ marginBottom: 40 }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 12 }}>
                        Contrib<em style={{ color: 'var(--accent-text)', fontStyle: 'italic' }}>Graph</em>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
                        Your GitHub activity, scored and ranked.<br />
                        Show recruiters what you actually ship.
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: '32px 28px',
                    boxShadow: 'var(--shadow-md)'
                }}>

                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 28 }}>
                        {[
                            { val: 'PRs', label: 'Merged' },
                            { val: 'Reviews', label: 'Submitted' },
                            { val: 'Score', label: 'Time-decayed' }
                        ].map(item => (
                            <div key={item.val} style={{
                                backgroundColor: 'var(--bg-elevated)',
                                borderRadius: 10,
                                padding: '12px 8px',
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-text)', marginBottom: 3 }}>{item.val}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* GitHub login button */}
                <a
                    href="http://localhost:5000/api/auth/github"
                    style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '13px 20px',
                    borderRadius: 10,
                    backgroundColor: 'var(--accent)',
                    color: 'var(--bg-base)',
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: 'none',
                    transition: 'opacity 0.15s'
                }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                    onMouseLeave={e => e.currentTarget.style.opacity = 1}
                    >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Continue with GitHub
                </a>

                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.5 }}>
                        We only read your public activity.<br />
                        No writing, no private data.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login