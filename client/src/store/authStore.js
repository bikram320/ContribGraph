import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getMe } from '../api/auth.api.js'

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            developer: null,
            isAuthenticated: false,
            isLoading: true,       // ← start true: ProtectedRoute waits until fetchMe settles
            hasHydrated: false,    // ← flips once on app boot, prevents fetchMe running twice

            setUser: (user, developer) => set({
                user,
                developer,
                isAuthenticated: !!user
            }),

            setDeveloper: (developer) => set({ developer }),

            setLoading: (isLoading) => set({ isLoading }),

            setHydrated: () => set({ hasHydrated: true }),

            logout: () => set({
                user: null,
                developer: null,
                isAuthenticated: false
            }),

            updateAvailability: (availability) => set((state) => ({
                developer: state.developer
                    ? { ...state.developer, availability }
                    : null
            })),

            updateScore: (score) => set((state) => ({
                developer: state.developer
                    ? { ...state.developer, score }
                    : null
            })),

            // Call once on app boot to verify cookie and hydrate user state
            fetchMe: async () => {
                try {
                    const res = await getMe()
                    set({
                        user: res.data.user,
                        developer: res.data.developer,
                        isAuthenticated: true,
                        isLoading: false,
                        hasHydrated: true
                    })
                } catch {
                    set({
                        user: null,
                        developer: null,
                        isAuthenticated: false,
                        isLoading: false,
                        hasHydrated: true
                    })
                }
            }
        }),
        {
            name: 'contribgraph-auth',
            // isLoading and hasHydrated are never persisted —
            // they must always reset to their initial values on page load
            partialize: (state) => ({
                user: state.user,
                developer: state.developer,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
)

export default useAuthStore