import { useEffect } from 'react'
import useAuthStore from '../store/authStore.js'
import { getMe } from '../api/auth.api.js'

const useAuth = () => {
    const { user, developer, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore()

    const fetchMe = async () => {
        setLoading(true)
        try {
            const res = await getMe()
            setUser(res.data.user, res.data.developer)
        } catch {
            logout()  // clears store if token is invalid
        } finally {
            setLoading(false)
        }
    }

    return { user, developer, isAuthenticated, isLoading, fetchMe, logout }
}

export default useAuth