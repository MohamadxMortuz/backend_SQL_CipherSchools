/**
 * Schema Information Utility
 * 
 * Retrieves table schema information from PostgreSQL workspace
 */

import { getPostgreSQLPool } from '../config/postgres.js'
import { getOrCreateWorkspaceSchema } from './schemaManager.js'

/**
 * Get table schema information from a workspace
 * Returns formatted schema description for LLM prompts
 */
export const getWorkspaceSchema = async (sessionId = null) => {
  const pool = getPostgreSQLPool()
  const schemaName = await getOrCreateWorkspaceSchema(sessionId)
  const client = await pool.connect()
  
  try {
    // Set search_path to the workspace schema
    await client.query(`SET search_path TO ${schemaName}, public`)
    
    // Get all tables in the schema
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = $1
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `, [schemaName])
    
    const tables = tablesResult.rows.map(row => row.table_name)
    
    if (tables.length === 0) {
      return 'No tables found in workspace.'
    }
    
    // Get schema information for each table
    const schemaDescriptions = []
    
    for (const tableName of tables) {
      // Get columns
      const columnsResult = await client.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = $1
        AND table_name = $2
        ORDER BY ordinal_position
      `, [schemaName, tableName])
      
      const columns = columnsResult.rows.map(col => {
        let desc = `  - ${col.column_name} (${col.data_type}`
        if (col.character_maximum_length) {
          desc += `(${col.character_maximum_length})`
        }
        if (col.is_nullable === 'NO') {
          desc += ', NOT NULL'
        }
        if (col.column_default) {
          desc += `, DEFAULT: ${col.column_default}`
        }
        desc += ')'
        return desc
      })
      
      // Get primary key
      const pkResult = await client.query(`
        SELECT column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = $1
        AND tc.table_name = $2
      `, [schemaName, tableName])
      
      const primaryKeys = pkResult.rows.map(row => row.column_name)
      
      // Get foreign keys
      const fkResult = await client.query(`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = $1
        AND tc.table_name = $2
      `, [schemaName, tableName])
      
      let tableDesc = `Table: ${tableName}\n`
      tableDesc += `Columns:\n${columns.join('\n')}`
      
      if (primaryKeys.length > 0) {
        tableDesc += `\nPrimary Key: ${primaryKeys.join(', ')}`
      }
      
      if (fkResult.rows.length > 0) {
        const fkDescriptions = fkResult.rows.map(fk => 
          `${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`
        )
        tableDesc += `\nForeign Keys:\n  ${fkDescriptions.join('\n  ')}`
      }
      
      schemaDescriptions.push(tableDesc)
    }
    
    return schemaDescriptions.join('\n\n')
  } catch (error) {
    console.error('Error getting workspace schema:', error)
    throw new Error(`Failed to get workspace schema: ${error.message}`)
  } finally {
    client.release()
  }
}





