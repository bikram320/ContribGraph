import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getMe } from '../api/auth.api.js'

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            developer: null,
            isAuthenticated: false,
            isLoading: true,
            hasHydrated: false,

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

            fetchMe: async () => {
                set({ isLoading: true })  // ← THE FIX: always block renders until resolved
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
            partialize: (state) => ({
                user: state.user,
                developer: state.developer,
                isAuthenticated: state.isAuthenticated
            }),
            // ← THE SECOND FIX: force isLoading true while persist is rehydrating
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.isLoading = true
                }
            }
        }
    )
)

export default useAuthStore