import express from 'express'
import { getAssignments, getAssignmentById } from '../controllers/assignmentController.js'

const router = express.Router()

// GET /assignments - Get all assignments
router.get('/', getAssignments)

// GET /assignments/:id - Get assignment by ID
router.get('/:id', getAssignmentById)

export default router





