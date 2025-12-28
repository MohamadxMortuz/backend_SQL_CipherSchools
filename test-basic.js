import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

const testBasicAPI = async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.LLM_API_KEY)
    
    // Try the simplest possible request
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const result = await model.generateContent("Hello")
    
    console.log('✅ API Key works!')
    console.log('Response:', result.response.text())
  } catch (error) {
    console.log('❌ API Key test failed:', error.message)
    
    // Try alternative approach
    try {
      console.log('Trying alternative model name...')
      const model = genAI.getGenerativeModel({ model: "models/gemini-pro" })
      const result = await model.generateContent("Hello")
      console.log('✅ Alternative model works!')
      console.log('Response:', result.response.text())
    } catch (error2) {
      console.log('❌ Alternative also failed:', error2.message)
    }
  }
}

testBasicAPI()