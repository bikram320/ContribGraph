const API_BASE = import.meta.env.VITE_API_URL

export const GITHUB_AUTH_URL = API_BASE.replace('/api', '') + '/api/auth/github'
export default API_BASE