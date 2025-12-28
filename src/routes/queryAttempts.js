import express from 'express'
import { saveAttempt, getAttempts } from '../controllers/queryAttemptController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// POST /api/query-attempts - Save a query attempt
router.post('/', saveAttempt)

// GET /api/query-attempts/:assignmentId - Get attempts for an assignment
router.get('/:assignmentId', getAttempts)

export default router




