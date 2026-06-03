import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            developer: null,
            isAuthenticated: false,
            isLoading: false,

            setUser: (user, developer) => set({
                user,
                developer,
                isAuthenticated: !!user
            }),

            setDeveloper: (developer) => set({ developer }),

            setLoading: (isLoading) => set({ isLoading }),

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
            }))
        }),
        {
            name: 'contribgraph-auth',
            // only persist these fields — not loading state
            partialize: (state) => ({
                user: state.user,
                developer: state.developer,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
)

export default useAuthStore