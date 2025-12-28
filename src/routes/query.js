import express from 'express'
import { executeQuery } from '../controllers/queryController.js'

const router = express.Router()

// POST /execute-query - Execute SQL query in PostgreSQL sandbox
router.post('/', executeQuery)

export default router





