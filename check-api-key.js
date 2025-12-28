import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = 'AIzaSyCkoEkFiMyBhTU6aTs8yDTFfsCF23G8IHQ'

const testAPIKey = async () => {
  console.log('🔑 Testing your Gemini API key...\n')
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY)
    
    // Test with the most basic model names
    const modelsToTest = [
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash', 
      'gemini-1.5-pro-latest',
      'gemini-1.5-pro',
      'gemini-pro'
    ]
    
    for (const modelName of modelsToTest) {
      try {
        console.log(`Testing model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent('Say hello')
        
        if (result?.response?.text()) {
          console.log(`✅ SUCCESS! Model ${modelName} works!`)
          console.log(`Response: ${result.response.text()}\n`)
          return true
        }
      } catch (error) {
        console.log(`❌ Model ${modelName} failed: ${error.message}`)
      }
    }
    
    console.log('\n❌ All models failed. Your API key might be:')
    console.log('- Expired or invalid')
    console.log('- Restricted in your region')
    console.log('- Not enabled for Gemini API')
    
    return false
    
  } catch (error) {
    console.log(`❌ API Key test failed: ${error.message}`)
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n🔧 Your API key is invalid or expired')
      console.log('Get a new one: https://makersuite.google.com/app/apikey')
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.log('\n🔧 Permission denied - check API key permissions')
    } else {
      console.log('\n🔧 Unknown error - check your internet connection')
    }
    
    return false
  }
}

testAPIKey()