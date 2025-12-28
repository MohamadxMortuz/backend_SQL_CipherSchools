import dotenv from 'dotenv'
import { connectMongoDB } from '../src/config/mongodb.js'
import { seedAssignments } from '../src/utils/seedData.js'

dotenv.config()

async function runSeed() {
  try {
    console.log('Connecting to MongoDB...')
    await connectMongoDB()
    
    console.log('Seeding assignments...')
    await seedAssignments()
    
    console.log('✓ Seeding completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('✗ Seeding failed:', error)
    process.exit(1)
  }
}

runSeed()




