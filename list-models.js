import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()

const listModels = async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.LLM_API_KEY)
    const models = await genAI.listModels()
    
    console.log('Available Gemini Models:')
    models.forEach(model => {
      console.log(`- ${model.name}`)
      if (model.supportedGenerationMethods?.includes('generateContent')) {
        console.log('  ✓ Supports generateContent')
      }
    })
  } catch (error) {
    console.error('Error listing models:', error.message)
  }
}

listModels()