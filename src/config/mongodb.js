import { MongoClient } from 'mongodb'

let client = null
let db = null

/**
 * Initialize MongoDB connection
 */
export const connectMongoDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
    const dbName = process.env.MONGODB_DB_NAME || 'cipher_sql_studio'

    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    })

    await client.connect()
    db = client.db(dbName)

    console.log('MongoDB connected successfully')
    console.log(`Database: ${dbName}`)

    return db
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

/**
 * Get MongoDB database instance
 */
export const getMongoDB = () => {
  if (!db) {
    throw new Error('MongoDB not initialized. Call connectMongoDB() first.')
  }
  return db
}

/**
 * Get MongoDB client instance
 */
export const getMongoClient = () => {
  if (!client) {
    throw new Error('MongoDB client not initialized. Call connectMongoDB() first.')
  }
  return client
}

/**
 * Close MongoDB connection
 */
export const closeMongoDB = async () => {
  if (client) {
    await client.close()
    console.log('MongoDB connection closed')
  }
}





