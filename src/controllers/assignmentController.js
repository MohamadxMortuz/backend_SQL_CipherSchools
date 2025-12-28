import { getAllAssignments, getAssignmentByObjectId } from '../models/assignmentModel.js'

/**
 * Get all assignments
 */
export const getAssignments = async (req, res, next) => {
  try {
    const assignments = await getAllAssignments()
    
    res.status(200).json({
      success: true,
      data: assignments,
      count: assignments.length
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get assignment by ID
 */
export const getAssignmentById = async (req, res, next) => {
  try {
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Assignment ID is required'
      })
    }
    
    const assignment = await getAssignmentByObjectId(id)
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: assignment
    })
  } catch (error) {
    next(error)
  }
}





