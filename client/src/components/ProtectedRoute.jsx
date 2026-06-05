import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, isLoading } = useAuthStore()

    // still fetching session — show nothing to avoid flash redirect
    if (isLoading) {
        return (
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12
                }}>
                    <div style={{
                        width: 32, height: 32,
                        borderRadius: '50%',
                        border: '2px solid var(--border)',
                        borderTopColor: 'var(--accent)',
                        animation: 'spin 0.8s linear infinite'
                    }} />
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: 'var(--text-muted)'
                    }}>
                        checking session...
                    </p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
        )
    }

    // not authenticated — go to landing, not login
    if (!isAuthenticated) {
        return <Navigate to="/" replace />
    }

    // authenticated but wrong role
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default ProtectedRoute