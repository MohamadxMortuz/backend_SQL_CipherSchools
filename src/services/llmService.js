/**
 * LLM Service for SQL Hints
 * 
 * Provides conceptual hints and guidance for SQL queries.
 * NEVER returns full SQL queries - only guidance and concepts.
 * Uses Google Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Call OpenAI API for hint generation
 */
const callOpenAI = async (prompt, apiKey, model = 'gpt-3.5-turbo') => {
  try {
    console.log('Calling OpenAI API with model:', model)
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 300,
        temperature: 0.7
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`)
    }
    
    const data = await response.json()
    const text = data.choices?.[0]?.message?.content
    
    if (!text) {
      throw new Error('OpenAI returned empty response')
    }
    
    console.log('✓ OpenAI response received successfully')
    return text
    
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error(`OpenAI API failed: ${error.message}`)
  }
}

/**
 * Generate a prompt that explicitly blocks SQL query solutions
 */
const createHintPrompt = (assignmentQuestion, tableSchema, userQuery) => {
  return `You are a SQL learning assistant helping students understand SQL concepts. Your role is to provide CONCEPTUAL GUIDANCE ONLY.

CRITICAL RULES:
1. NEVER provide full SQL queries or code solutions
2. NEVER write complete SELECT statements
3. NEVER show table names in a query format
4. ONLY provide conceptual hints, guidance, and explanations
5. Guide the student to discover the solution themselves
6. Focus on SQL concepts, not code

Assignment Question:
${assignmentQuestion}

Available Tables and Schema:
${tableSchema}

Student's Current Query:
${userQuery}

Provide a helpful hint that:
- Explains relevant SQL concepts they should consider
- Points them in the right direction without giving the answer
- Suggests which tables or columns might be relevant
- Explains what type of operation they might need (JOIN, WHERE, GROUP BY, etc.)
- Does NOT include any SQL code
- Does NOT show table names in query format
- Is encouraging and educational

Remember: You are teaching, not solving. Guide them to learn.

Hint:`
}

/**
 * Sanitize LLM response to ensure no SQL queries are returned
 */
const sanitizeResponse = (response) => {
  if (!response || typeof response !== 'string') {
    return 'Please try a different approach to solve this problem.'
  }
  
  let sanitized = response.trim()
  
  // Remove any SQL-like patterns
  const sqlPatterns = [
    /SELECT\s+[\s\S]*?FROM\s+[\s\S]*?;/gi,
    /SELECT\s+[\s\S]*?FROM\s+[\s\S]*?$/gi,
    /INSERT\s+INTO\s+[\s\S]*?;/gi,
    /UPDATE\s+[\s\S]*?SET\s+[\s\S]*?;/gi,
    /DELETE\s+FROM\s+[\s\S]*?;/gi,
    /CREATE\s+TABLE\s+[\s\S]*?;/gi,
    /ALTER\s+TABLE\s+[\s\S]*?;/gi,
    /DROP\s+TABLE\s+[\s\S]*?;/gi
  ]
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(sanitized)) {
      // If SQL found, replace with generic guidance
      return 'Think about the SQL concepts you need to use. Consider which tables and columns are relevant, and what operations might help you achieve the goal.'
    }
  }
  
  // Check for common SQL keywords that might indicate code
  const sqlKeywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'GROUP BY', 'ORDER BY']
  const upperResponse = sanitized.toUpperCase()
  
  // If response contains SQL keywords in a way that looks like code, sanitize
  if (sqlKeywords.some(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b.*?\\b(FROM|WHERE|JOIN|BY)\\b`, 'i')
    return regex.test(sanitized)
  })) {
    return 'Consider the SQL concepts needed for this problem. Think about which tables contain the data you need and what operations will help you combine or filter that data.'
  }
  
  return sanitized
}

/**
 * Call Google Gemini API for hint generation
 */
const callGemini = async (prompt, apiKey, model = 'gemini-1.5-flash') => {
  try {
    console.log('Testing Gemini API connection...')
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Try different model configurations
    const modelConfigs = [
      { model: 'gemini-2.0-flash-exp' },
      { model: 'gemini-exp-1206' },
      { model: 'gemini-exp-1121' },
      { model: 'gemini-1.5-flash-8b' },
      { model: 'gemini-1.5-flash-002' },
      { model: 'gemini-1.5-flash-001' },
      { model: 'gemini-1.5-pro-002' },
      { model: 'gemini-1.5-pro-001' }
    ]
    
    for (const config of modelConfigs) {
      try {
        console.log(`Trying model: ${config.model}`)
        const generativeModel = genAI.getGenerativeModel({
          model: config.model,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300
          }
        })
        
        const result = await generativeModel.generateContent(prompt)
        
        if (result?.response) {
          const text = result.response.text()
          if (text && text.trim().length > 0) {
            console.log(`✅ Success with model: ${config.model}`)
            return text
          }
        }
      } catch (modelError) {
        console.log(`Model ${config.model} failed: ${modelError.message}`)
        continue
      }
    }
    
    throw new Error('All Gemini models failed or are unavailable in your region')
    
  } catch (error) {
    console.error('Gemini API error:', error.message)
    
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('expired')) {
      throw new Error('Gemini API key has expired. Please get a new API key from Google AI Studio.')
    } else if (error.message?.includes('API key')) {
      throw new Error('Invalid Gemini API key. Please check your LLM_API_KEY.')
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      throw new Error('Permission denied. Check your Gemini API key permissions.')
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('Gemini API quota exceeded. Please check your usage limits.')
    } else if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.')
    } else if (error.message?.includes('region') || error.message?.includes('unavailable')) {
      throw new Error('Gemini API may not be available in your region. Consider using a VPN or different API provider.')
    }
    
    throw new Error(`Gemini API error: ${error.message}`)
  }
}

/**
 * Generate SQL hint using LLM
 * 
 * @param {string} assignmentQuestion - The assignment question
 * @param {string} tableSchema - Table schema information
 * @param {string} userQuery - User's current SQL query attempt
 * @returns {Promise<string>} Conceptual hint (no SQL code)
 */
export const generateSQLHint = async (assignmentQuestion, tableSchema, userQuery) => {
  const provider = process.env.LLM_PROVIDER || 'disabled'
  const apiKey = process.env.LLM_API_KEY
  
  // If provider is disabled, return enhanced fallback hint
  if (provider === 'disabled') {
    return generateEnhancedFallbackHint(assignmentQuestion, tableSchema, userQuery)
  }
  
  if (!apiKey) {
    throw new Error('LLM_API_KEY environment variable is not set')
  }
  
  // Create prompt with explicit blocking of SQL solutions
  const prompt = createHintPrompt(assignmentQuestion, tableSchema, userQuery)
  
  try {
    let response
    
    switch (provider.toLowerCase()) {
      case 'gemini':
        // Use stable Gemini model with fallback
        const modelName = process.env.LLM_MODEL || 'gemini-1.5-flash'
        try {
          response = await callGemini(prompt, apiKey, modelName)
        } catch (modelError) {
          // Fallback to gemini-pro if the specified model fails
          if (modelError.message.includes('MODEL_NOT_FOUND') && modelName !== 'gemini-pro') {
            console.log('Falling back to gemini-pro model...')
            response = await callGemini(prompt, apiKey, 'gemini-pro')
          } else {
            throw modelError
          }
        }
        break
      
      case 'openai':
        response = await callOpenAI(prompt, apiKey, process.env.LLM_MODEL || 'gpt-3.5-turbo')
        break
      
      default:
        throw new Error(`Unsupported LLM provider: ${provider}. Supported: gemini, openai, disabled`)
    }
    
    // Sanitize response to ensure no SQL queries
    const sanitized = sanitizeResponse(response)
    
    return sanitized
  } catch (error) {
    console.error('LLM API error:', error)
    throw new Error(`Failed to generate hint: ${error.message}`)
  }
}

/**
 * Generate enhanced fallback hint when LLM is unavailable
 */
const generateEnhancedFallbackHint = (assignmentQuestion, tableSchema, userQuery) => {
  const question = assignmentQuestion.toLowerCase()
  const query = userQuery.toLowerCase()
  const schema = tableSchema.toLowerCase()
  
  let hint = 'Here\'s a helpful hint for your SQL query:\n\n'
  
  // Analyze the assignment question for keywords
  if (question.includes('join') || question.includes('combine') || question.includes('both tables')) {
    hint += '• This query requires joining multiple tables\n'
    hint += '• Look for common columns between tables to establish relationships\n'
    hint += '• Consider using INNER JOIN, LEFT JOIN, or RIGHT JOIN\n\n'
  }
  
  if (question.includes('count') || question.includes('how many')) {
    hint += '• Use COUNT() function to count records\n'
    hint += '• Consider using COUNT(*) or COUNT(column_name)\n\n'
  }
  
  if (question.includes('average') || question.includes('avg')) {
    hint += '• Use AVG() function to calculate averages\n'
    hint += '• Make sure to select numeric columns for averaging\n\n'
  }
  
  if (question.includes('maximum') || question.includes('highest') || question.includes('max')) {
    hint += '• Use MAX() function to find the highest value\n'
    hint += '• Consider what column contains the values you want to maximize\n\n'
  }
  
  if (question.includes('minimum') || question.includes('lowest') || question.includes('min')) {
    hint += '• Use MIN() function to find the lowest value\n\n'
  }
  
  if (question.includes('group') || question.includes('by department') || question.includes('by category')) {
    hint += '• Use GROUP BY to group records by a specific column\n'
    hint += '• Aggregate functions work well with GROUP BY\n\n'
  }
  
  if (question.includes('order') || question.includes('sort')) {
    hint += '• Use ORDER BY to sort your results\n'
    hint += '• Add ASC for ascending or DESC for descending order\n\n'
  }
  
  // Analyze current query
  if (!query.includes('select')) {
    hint += '• Start your query with SELECT\n'
    hint += '• Specify which columns you want to retrieve\n\n'
  }
  
  if (!query.includes('from')) {
    hint += '• Add FROM clause to specify which table(s) to query\n\n'
  }
  
  if (question.includes('where') || question.includes('filter') || question.includes('specific')) {
    if (!query.includes('where')) {
      hint += '• Use WHERE clause to filter your results\n'
      hint += '• Add conditions to match specific criteria\n\n'
    }
  }
  
  // Schema-based hints
  if (schema.includes('employee')) {
    hint += '• Available employee-related columns might include: id, name, department, salary, hire_date\n'
  }
  
  if (schema.includes('department')) {
    hint += '• Department information might be in a separate table or column\n'
  }
  
  hint += '\n• Review the table schema to understand available columns\n'
  hint += '• Make sure your column names match exactly what\'s in the database\n'
  hint += '• Test your query step by step, starting with a simple SELECT statement'
  
  return hint
}
