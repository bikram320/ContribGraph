import express from 'express'
import {
    searchDevelopers,
    saveDeveloper,
    getSavedDevelopers,
    removeSavedDeveloper
} from '../controllers/search.controller.js'
import auth from '../middleware/auth.js'
import rbac from '../middleware/rbac.js'

const router = express.Router()

// all search routes are recruiter-only
router.get('/developers', auth, rbac('recruiter', 'admin'), searchDevelopers)
router.post('/saved', auth, rbac('recruiter'), saveDeveloper)
router.get('/saved', auth, rbac('recruiter'), getSavedDevelopers)
router.delete('/saved/:developerId', auth, rbac('recruiter'), removeSavedDeveloper)

export default router