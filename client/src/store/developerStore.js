import { create } from 'zustand'

const useDeveloperStore = create((set) => ({
    profile: null,
    scoreBreakdown: null,
    scoreHistory: [],
    events: [],
    isSyncing: false,
    isLoading: false,
    error: null,

    setProfile: (profile) => set({ profile }),
    setScoreBreakdown: (scoreBreakdown) => set({ scoreBreakdown }),
    setScoreHistory: (scoreHistory) => set({ scoreHistory }),
    setEvents: (events) => set({ events }),
    setSyncing: (isSyncing) => set({ isSyncing }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // called after a successful sync
    updateAfterSync: (score, breakdown) => set((state) => ({
        profile: state.profile ? { ...state.profile, score } : null,
        scoreBreakdown: breakdown,
        isSyncing: false
    }))
}))

export default useDeveloperStore