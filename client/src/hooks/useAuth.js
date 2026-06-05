import useAuthStore from '../store/authStore.js'
import { getMe } from '../api/auth.api.js'

const useAuth = () => {
    const {
        user, developer, isAuthenticated, isLoading, hasHydrated,
        setUser, setLoading, setHydrated, logout
    } = useAuthStore()

    const fetchMe = async () => {
        // Guard: only run once per app session.
        // hasHydrated is never persisted so it resets to false on every
        // page load — this means fetchMe runs exactly once per boot.
        if (hasHydrated) return

        setHydrated()    // flip immediately so concurrent calls are no-ops
        setLoading(true)

        try {
            const res = await getMe()
            setUser(res.data.user, res.data.developer)
        } catch {
            // Cookie missing, expired, or invalid — clear stale persisted state
            logout()
        } finally {
            setLoading(false)
        }
    }

    return { user, developer, isAuthenticated, isLoading, fetchMe, logout }
}

export default useAuth