import api from './axios.js'

export const searchDevelopers = (filters) =>
    api.get('/search/developers', { params: filters })

export const saveDeveloper = (developerId) =>
    api.post('/search/saved', { developerId })

export const getSavedDevelopers = () => api.get('/search/saved')

export const removeSavedDeveloper = (developerId) =>
    api.delete(`/search/saved/${developerId}`)