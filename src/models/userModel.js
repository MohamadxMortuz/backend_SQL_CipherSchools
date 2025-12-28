import { getMongoDB } from '../config/mongodb.js'
import bcrypt from 'bcryptjs'
import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'users'

/**
 * Create a new user
 */
export const createUser = async (email, password, name) => {
  const db = getMongoDB()
  const collection = db.collection(COLLECTION_NAME)
  
  // Check if user already exists
  const existingUser = await collection.findOne({ email: email.toLowerCase() })
  if (existingUser) {
    throw new Error('User with this email already exists')
  }
  
  // Hash password
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  
  // Create user
  const user = {
    email: email.toLowerCase(),
    password: hashedPassword,
    name: name || '',
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  const result = await collection.insertOne(user)
  return { _id: result.insertedId, email: user.email, name: user.name }
}

/**
 * Find user by email
 */
export const findUserByEmail = async (email) => {
  const db = getMongoDB()
  const collection = db.collection(COLLECTION_NAME)
  return await collection.findOne({ email: email.toLowerCase() })
}

/**
 * Find user by ID
 */
export const findUserById = async (userId) => {
  const db = getMongoDB()
  const collection = db.collection(COLLECTION_NAME)
  
  try {
    return await collection.findOne({ _id: new ObjectId(userId) })
  } catch (error) {
    return null
  }
}

/**
 * Verify user password
 */
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}




