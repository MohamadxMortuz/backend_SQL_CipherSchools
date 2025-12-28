import express from 'express'
import assignmentsRoutes from './assignments.js'
import queryRoutes from './query.js'
import hintRoutes from './hint.js'
import authRoutes from './auth.js'
import queryAttemptRoutes from './queryAttempts.js'
import { optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// API info route
router.get('/', (req, res) => {
  res.json({
    message: 'CipherSQLStudio API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      assignments: '/api/assignments',
      executeQuery: '/api/execute-query',
      getHint: '/api/get-hint',
      auth: '/api/auth',
      queryAttempts: '/api/query-attempts'
    }
  })
})

// Mount route modules
router.use('/assignments', assignmentsRoutes)
router.use('/execute-query', optionalAuth, queryRoutes) // Optional auth for query execution
router.use('/get-hint', hintRoutes)
router.use('/auth', authRoutes)
router.use('/query-attempts', queryAttemptRoutes)

export default router

