import dotenv from 'dotenv'
import { generateSQLHint } from './src/services/llmService.js'

// Load environment variables
dotenv.config()

const testGeminiAPI = async () => {
  console.log('🧪 Testing Gemini API Integration...\n')
  
  // Check environment variables
  console.log('Environment Check:')
  console.log(`- LLM_PROVIDER: ${process.env.LLM_PROVIDER}`)
  console.log(`- LLM_MODEL: ${process.env.LLM_MODEL}`)
  console.log(`- LLM_API_KEY: ${process.env.LLM_API_KEY ? 'Set ✓' : 'Missing ✗'}\n`)
  
  if (!process.env.LLM_API_KEY) {
    console.error('❌ LLM_API_KEY is not set in .env file')
    process.exit(1)
  }
  
  // Test data
  const testAssignment = 'Find all employees who work in the Sales department'
  const testSchema = 'employees table: id, name, department, salary'
  const testQuery = 'SELECT * FROM employees'
  
  try {
    console.log('Testing Gemini API call...')
    console.log(`Assignment: ${testAssignment}`)
    console.log(`Schema: ${testSchema}`)
    console.log(`User Query: ${testQuery}\n`)
    
    const hint = await generateSQLHint(testAssignment, testSchema, testQuery)
    
    console.log('✅ Success! Gemini API is working correctly.')
    console.log('Generated Hint:')
    console.log('─'.repeat(50))
    console.log(hint)
    console.log('─'.repeat(50))
    
  } catch (error) {
    console.error('❌ Gemini API Test Failed:')
    console.error(`Error: ${error.message}`)
    
    // Provide troubleshooting suggestions
    console.log('\n🔧 Troubleshooting Suggestions:')
    
    if (error.message.includes('API key')) {
      console.log('- Verify your Gemini API key is correct')
      console.log('- Get a new API key from: https://makersuite.google.com/app/apikey')
    } else if (error.message.includes('MODEL_NOT_FOUND')) {
      console.log('- Try changing LLM_MODEL to "gemini-1.5-flash" or "gemini-pro"')
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      console.log('- Check your API usage limits in Google AI Studio')
      console.log('- Wait for quota reset or upgrade your plan')
    } else if (error.message.includes('network')) {
      console.log('- Check your internet connection')
      console.log('- Verify firewall settings')
    }
    
    process.exit(1)
  }
}

// Run the test
testGeminiAPI()