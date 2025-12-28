import { getAssignmentByObjectId } from '../models/assignmentModel.js'
import { generateSQLHint } from '../services/llmService.js'
import { getWorkspaceSchema } from '../utils/schemaInfo.js'

/**
 * Get hint for an assignment using LLM
 * 
 * Input:
 * - assignmentId: Assignment ID
 * - userQuery: User's current SQL query attempt
 * - sessionId: Optional session ID for workspace schema
 * 
 * Output:
 * - Text hint only (conceptual guidance, no SQL queries)
 */
export const getHint = async (req, res, next) => {
  try {
    const { assignmentId, userQuery, sessionId } = req.body
    
    // Validate input
    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        error: 'Assignment ID is required'
      })
    }
    
    if (!userQuery || typeof userQuery !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'User query is required and must be a string'
      })
    }
    
    console.log('Hint request for assignment:', assignmentId)
    console.log('User query:', userQuery.substring(0, 100))
    
    // Get assignment
    const assignment = await getAssignmentByObjectId(assignmentId)
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      })
    }
    
    // Get assignment question
    const assignmentQuestion = assignment.question || assignment.description || assignment.title || 'SQL Assignment'
    
    // Get table schema from workspace
    let tableSchema
    try {
      tableSchema = await getWorkspaceSchema(sessionId)
      console.log('Schema retrieved from workspace')
    } catch (error) {
      console.error('Error getting workspace schema:', error)
      // Fallback to basic schema description if available
      tableSchema = assignment.schema || 'Table schema information not available.'
      console.log('Using fallback schema:', tableSchema.substring(0, 100))
    }
    
    // Generate hint using LLM
    try {
      console.log('Calling generateSQLHint...')
      const hint = await generateSQLHint(assignmentQuestion, tableSchema, userQuery)
      
      console.log('Hint generated successfully')
      res.status(200).json({
        success: true,
        data: {
          hint,
          assignmentId,
          generatedAt: new Date().toISOString()
        }
      })
    } catch (llmError) {
      // If LLM service fails, return a generic hint based on the assignment
      console.error('LLM hint generation error:', llmError)
      
      // Provide more specific fallback hints based on error type
      let fallbackHint = 'AI hint service is temporarily unavailable. '
      
      if (llmError.message.includes('API key') || llmError.message.includes('PERMISSION_DENIED')) {
        fallbackHint += 'Please check the API configuration. '
      } else if (llmError.message.includes('QUOTA_EXCEEDED')) {
        fallbackHint += 'API quota exceeded. '
      } else if (llmError.message.includes('RATE_LIMIT')) {
        fallbackHint += 'Rate limit reached. Please try again in a moment. '
      }
      
      fallbackHint += 'Here are some general tips:\n'
      
      if (userQuery.toLowerCase().includes('select') && userQuery.toLowerCase().includes('from')) {
        fallbackHint += '- Your query has the basic SELECT...FROM structure. Good start!\n'
        fallbackHint += '- Check if you\'re selecting the right columns.\n'
        fallbackHint += '- Make sure you\'re querying the correct table.\n'
      } else if (!userQuery.toLowerCase().includes('select')) {
        fallbackHint += '- Remember to start with a SELECT statement.\n'
        fallbackHint += '- Example: SELECT column_name FROM table_name\n'
      }
      
      fallbackHint += '- Review the assignment question carefully.\n'
      fallbackHint += '- Check the available table schema.\n'
      fallbackHint += '- Consider what columns you need and which tables contain them.'
      
      res.status(200).json({
        success: true,
        data: {
          hint: fallbackHint,
          assignmentId,
          generatedAt: new Date().toISOString(),
          isGenericHint: true,
          errorType: llmError.message.includes('API key') ? 'configuration' : 'service'
        }
      })
    }
  } catch (error) {
    console.error('Unexpected error in getHint:', error)
    next(error)
  }
}

