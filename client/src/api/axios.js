import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,  // send HttpOnly cookies with every request
    headers: { 'Content-Type': 'application/json' }
})

// response interceptor — handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // clear local state — logout is already handled
            // in useAuth.js fetchMe() function
            localStorage.removeItem('contribgraph-auth')
        }
        return Promise.reject(error)
    }
)

export default api