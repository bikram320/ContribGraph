import api from './axios.js'

export const getMe = () => api.get('/auth/me')
export const logout = () => api.post('/auth/logout')
export const switchRole = (role) => api.patch('/auth/role', { role })