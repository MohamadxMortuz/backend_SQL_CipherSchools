/**
 * SQL Query Validator and Sanitizer
 * 
 * This module validates and sanitizes SQL queries to prevent:
 * - SQL injection attacks
 * - Dangerous operations (DROP, DELETE, TRUNCATE, etc.)
 * - Unauthorized schema modifications
 */

// Dangerous SQL keywords that should be blocked
const DANGEROUS_KEYWORDS = [
  'DROP',
  'DELETE',
  'TRUNCATE',
  'ALTER',
  'CREATE',
  'GRANT',
  'REVOKE',
  'INSERT',
  'UPDATE',
  'EXEC',
  'EXECUTE',
  'CALL',
  'MERGE',
  'COPY',
  'IMPORT',
  'EXPORT'
]

// Allowed SQL keywords for SELECT queries
const ALLOWED_KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'FULL JOIN',
  'ON',
  'GROUP BY',
  'ORDER BY',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'AS',
  'AND',
  'OR',
  'NOT',
  'IN',
  'EXISTS',
  'LIKE',
  'ILIKE',
  'BETWEEN',
  'IS NULL',
  'IS NOT NULL',
  'COUNT',
  'SUM',
  'AVG',
  'MAX',
  'MIN',
  'DISTINCT',
  'UNION',
  'UNION ALL',
  'INTERSECT',
  'EXCEPT',
  'WITH',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END'
]

/**
 * Check if query contains dangerous keywords
 */
const containsDangerousKeywords = (query) => {
  const upperQuery = query.toUpperCase().trim()
  
  // Check for dangerous keywords (not as part of comments or strings)
  for (const keyword of DANGEROUS_KEYWORDS) {
    // Use word boundary regex to avoid false positives
    const regex = new RegExp(`\\b${keyword}\\b`, 'i')
    if (regex.test(query)) {
      return { dangerous: true, keyword }
    }
  }
  
  return { dangerous: false }
}

/**
 * Validate SQL query structure
 */
const validateQueryStructure = (query) => {
  const trimmedQuery = query.trim()
  
  if (!trimmedQuery) {
    return { valid: false, error: 'Query cannot be empty' }
  }
  
  // Must start with SELECT or WITH
  const upperQuery = trimmedQuery.toUpperCase()
  if (!upperQuery.startsWith('SELECT') && !upperQuery.startsWith('WITH')) {
    return { valid: false, error: 'Query must start with SELECT or WITH' }
  }
  
  return { valid: true }
}

/**
 * Sanitize SQL query
 * Removes comments and normalizes whitespace
 */
const sanitizeQuery = (query) => {
  let sanitized = query.trim()
  
  // Remove single-line comments (-- comment)
  sanitized = sanitized.replace(/--.*$/gm, '')
  
  // Remove multi-line comments (/* comment */)
  sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '')
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim()
  
  return sanitized
}

/**
 * Validate and sanitize SQL query
 * @param {string} query - SQL query to validate
 * @returns {Object} Validation result with isValid, query, and error message
 */
export const validateSQL = (query) => {
  if (!query || typeof query !== 'string') {
    return {
      isValid: false,
      error: 'Query must be a non-empty string',
      query: null
    }
  }
  
  // Sanitize query
  const sanitized = sanitizeQuery(query)
  
  // Check structure
  const structureCheck = validateQueryStructure(sanitized)
  if (!structureCheck.valid) {
    return {
      isValid: false,
      error: structureCheck.error,
      query: null
    }
  }
  
  // Check for dangerous keywords
  const dangerCheck = containsDangerousKeywords(sanitized)
  if (dangerCheck.dangerous) {
    return {
      isValid: false,
      error: `Query contains prohibited keyword: ${dangerCheck.keyword}. Only SELECT queries are allowed.`,
      query: null
    }
  }
  
  return {
    isValid: true,
    error: null,
    query: sanitized
  }
}





