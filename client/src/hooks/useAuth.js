import { useCallback } from 'react'
import useAuthStore from '../store/authStore.js'
import { getMe } from '../api/auth.api.js'

const useAuth = () => {
    const {
        user,
        developer,
        isAuthenticated,
        isLoading,
        setUser,
        setLoading,
        logout
    } = useAuthStore()

    const fetchMe = useCallback(async () => {
        // don't refetch if already authenticated and user is loaded
        if (useAuthStore.getState().isAuthenticated && useAuthStore.getState().user) {
            return
        }

        setLoading(true)
        try {
            const res = await getMe()
            setUser(res.data.user, res.data.developer)
        } catch {
            // 401 = no valid cookie — clear store silently
            logout()
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        user,
        developer,
        isAuthenticated,
        isLoading,
        fetchMe,
        logout
    }
}

export default useAuth