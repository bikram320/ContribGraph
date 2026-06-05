import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, isLoading, user } = useAuthStore()

    // fetchMe hasn't resolved yet — render nothing so we don't
    // flash a redirect before we know the real auth state
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh'
            }}>
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    fontSize: 13
                }}>
                    loading...
                </div>
            </div>
        )
    }

    if (!isAuthenticated) return <Navigate to="/" replace />

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default ProtectedRoute