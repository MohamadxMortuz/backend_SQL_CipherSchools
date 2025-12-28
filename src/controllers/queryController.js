import { validateSQL } from '../utils/sqlValidator.js'
import { executeQueryInWorkspace } from '../utils/schemaManager.js'
import { saveQueryAttempt } from '../models/queryAttemptModel.js'

/**
 * Execute SQL query in PostgreSQL workspace
 * 
 * Requirements:
 * - Uses CREATE SCHEMA workspace_<id>
 * - Uses SET search_path TO workspace_<id>
 * - Pre-created tables with sample data
 * - Prevents DROP, DELETE, ALTER queries
 * - Returns rows or error messages
 */
export const executeQuery = async (req, res, next) => {
  try {
    const { query, sessionId } = req.body
    
    // Validate input
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query is required and must be a string'
      })
    }
    
    // Validate and sanitize SQL query
    // This prevents DROP, DELETE, ALTER queries
    const validation = validateSQL(query)
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
        query: null
      })
    }
    
    // Execute query in workspace schema
    // Workspace is created with sample data if it doesn't exist
    try {
      const result = await executeQueryInWorkspace(validation.query, sessionId)
      
      // Save query attempt if user is authenticated
      if (req.user && req.body.assignmentId) {
        try {
          await saveQueryAttempt(
            req.user.id,
            req.body.assignmentId,
            validation.query,
            result,
            null
          )
        } catch (saveError) {
          // Log but don't fail the request
          console.error('Error saving query attempt:', saveError)
        }
      }
      
      res.status(200).json({
        success: true,
        data: {
          rows: result.rows,
          rowCount: result.rowCount,
          columns: result.columns
        }
      })
    } catch (dbError) {
      // Save failed attempt if user is authenticated
      if (req.user && req.body.assignmentId) {
        try {
          await saveQueryAttempt(
            req.user.id,
            req.body.assignmentId,
            validation.query,
            null,
            dbError.message
          )
        } catch (saveError) {
          console.error('Error saving failed query attempt:', saveError)
        }
      }
      
      // Handle database errors and return proper error messages
      res.status(400).json({
        success: false,
        error: dbError.message || 'Query execution failed',
        details: dbError.detail || null,
        hint: dbError.hint || null,
        code: dbError.code || null
      })
    }
  } catch (error) {
    next(error)
  }
}

