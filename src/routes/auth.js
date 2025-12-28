import express from 'express'
import { signup, login, getCurrentUser } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// POST /api/auth/signup - Register new user
router.post('/signup', signup)

// POST /api/auth/login - Login user
router.post('/login', login)

// GET /api/auth/me - Get current user (protected)
router.get('/me', authenticate, getCurrentUser)

export default router




