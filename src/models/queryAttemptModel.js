import { getMongoDB } from '../config/mongodb.js'
import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'queryAttempts'

/**
 * Save a query attempt
 */
export const saveQueryAttempt = async (userId, assignmentId, query, result, error) => {
  const db = getMongoDB()
  const collection = db.collection(COLLECTION_NAME)
  
  const attempt = {
    userId: new ObjectId(userId),
    assignmentId: new ObjectId(assignmentId),
    query: query,
    result: result ? {
      rowCount: result.rowCount,
      columns: result.columns
    } : null,
    error: error || null,
    success: !error,
    executedAt: new Date(),
    createdAt: new Date()
  }
  
  const resultDoc = await collection.insertOne(attempt)
  return resultDoc.insertedId
}

/**
 * Get query attempts for a user and assignment
 */
export const getUserQueryAttempts = async (userId, assignmentId) => {
  const db = getMongoDB()
  const collection = db.collection(COLLECTION_NAME)
  
  const attempts = await collection
    .find({
      userId: new ObjectId(userId),
      assignmentId: new ObjectId(assignmentId)
    })
    .sort({ executedAt: -1 })
    .limit(50)
    .toArray()
  
  return attempts
}

/**
 * Get all query attempts for a user
 */
export const getAllUserQueryAttempts = async (userId) => {
  const db = getMongoDB()
  const collection = db.collection(COLLECTION_NAME)
  
  const attempts = await collection
    .find({ userId: new ObjectId(userId) })
    .sort({ executedAt: -1 })
    .limit(100)
    .toArray()
  
  return attempts
}




