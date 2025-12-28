import { saveQueryAttempt, getUserQueryAttempts } from '../models/queryAttemptModel.js'

/**
 * Save a query attempt
 */
export const saveAttempt = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { assignmentId, query, result, error } = req.body
    
    // Validate input
    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        error: 'Assignment ID is required'
      })
    }
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      })
    }
    
    // Save attempt
    const attemptId = await saveQueryAttempt(userId, assignmentId, query, result, error)
    
    res.status(201).json({
      success: true,
      data: {
        attemptId: attemptId.toString()
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get query attempts for a user and assignment
 */
export const getAttempts = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { assignmentId } = req.params
    
    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        error: 'Assignment ID is required'
      })
    }
    
    const attempts = await getUserQueryAttempts(userId, assignmentId)
    
    res.status(200).json({
      success: true,
      data: {
        attempts,
        count: attempts.length
      }
    })
  } catch (error) {
    next(error)
  }
}




