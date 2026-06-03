import api from './axios.js'

export const getMyProfile = () => api.get('/developers/me')
export const getPublicProfile = (username) => api.get(`/developers/profile/${username}`)
export const syncGitHub = (accessToken) => api.post('/developers/sync', { accessToken })
export const updateAvailability = (availability) => api.patch('/developers/availability', { availability })
export const getMyEvents = (page = 1) => api.get(`/developers/me/events?page=${page}`)