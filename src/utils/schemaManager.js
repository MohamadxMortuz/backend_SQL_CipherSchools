import { getPostgreSQLPool } from '../config/postgres.js'
import { initializeWorkspaceTables } from './sampleData.js'

/**
 * PostgreSQL Schema Manager
 * 
 * Manages workspace schemas for query execution isolation
 */

const WORKSPACE_SCHEMA_PREFIX = 'workspace_'

/**
 * Generate a unique workspace schema name
 */
const generateSchemaName = (sessionId) => {
  // Use sessionId or generate a random one
  const id = sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  // Sanitize ID to ensure valid PostgreSQL identifier
  const sanitizedId = id.replace(/[^a-zA-Z0-9_]/g, '_')
  return `${WORKSPACE_SCHEMA_PREFIX}${sanitizedId}`
}

/**
 * Create a workspace schema with sample data
 */
export const createWorkspaceSchema = async (sessionId = null) => {
  const pool = getPostgreSQLPool()
  const schemaName = generateSchemaName(sessionId)
  const client = await pool.connect()
  
  try {
    // Create schema if it doesn't exist
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`)
    
    // Initialize sample tables with data
    await initializeWorkspaceTables(client, schemaName)
    
    return schemaName
  } catch (error) {
    console.error('Error creating workspace schema:', error)
    throw new Error(`Failed to create workspace schema: ${error.message}`)
  } finally {
    client.release()
  }
}

/**
 * Get or create a workspace schema for a session
 * Initializes with sample data if creating new workspace
 */
export const getOrCreateWorkspaceSchema = async (sessionId = null) => {
  const pool = getPostgreSQLPool()
  const schemaName = generateSchemaName(sessionId)
  const client = await pool.connect()
  
  try {
    // Check if schema exists
    const result = await client.query(
      `SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1`,
      [schemaName]
    )
    
    if (result.rows.length === 0) {
      // Create schema if it doesn't exist
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`)
      
      // Initialize sample tables with data
      await initializeWorkspaceTables(client, schemaName)
    }
    
    return schemaName
  } catch (error) {
    console.error('Error getting/creating workspace schema:', error)
    throw new Error(`Failed to get/create workspace schema: ${error.message}`)
  } finally {
    client.release()
  }
}

/**
 * Execute query in a workspace schema
 * Uses SET search_path TO workspace_<id> for isolation
 */
export const executeQueryInWorkspace = async (query, sessionId = null) => {
  const pool = getPostgreSQLPool()
  const schemaName = await getOrCreateWorkspaceSchema(sessionId)
  
  const client = await pool.connect()
  
  try {
    // Set search_path to use the workspace schema
    await client.query(`SET search_path TO ${schemaName}, public`)
    
    // Execute the query
    const result = await client.query(query)
    
    return {
      rows: result.rows,
      rowCount: result.rowCount,
      columns: result.fields?.map(field => ({
        name: field.name,
        dataTypeID: field.dataTypeID,
        dataType: field.dataTypeName || 'unknown'
      })) || []
    }
  } catch (error) {
    // Return error information
    throw {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    }
  } finally {
    client.release()
  }
}

/**
 * Clean up a workspace schema (optional - for cleanup operations)
 */
export const dropWorkspaceSchema = async (schemaName) => {
  const pool = getPostgreSQLPool()
  
  try {
    // Only drop schemas that match our prefix
    if (!schemaName.startsWith(WORKSPACE_SCHEMA_PREFIX)) {
      throw new Error('Invalid schema name for deletion')
    }
    
    await pool.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`)
    return true
  } catch (error) {
    console.error('Error dropping workspace schema:', error)
    throw new Error(`Failed to drop workspace schema: ${error.message}`)
  }
}

