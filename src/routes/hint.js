import express from 'express'
import { getHint } from '../controllers/hintController.js'

const router = express.Router()

// POST /get-hint - Get hint for an assignment
router.post('/', getHint)

export default router





