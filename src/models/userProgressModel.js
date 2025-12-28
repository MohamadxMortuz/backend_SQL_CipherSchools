import { getMongoDB } from '../config/mongodb.js'

const COLLECTION_NAME = 'userProgress'

/**
 * Get user progress by user ID
 */
export const getUserProgress = async (userId) => {
  const db = getMongoDB()
  const collection = db.collection(COLLECTION_NAME)
  const progress = await collection.findOne({ userId })
  return progress
}

/**
 * Update or create user progress
 */
export const upsertUserProgress = async (userId, progressData) => {
  const db = getMongoDB()
  const collection = db.collection(COLLECTION_NAME)
  const result = await collection.updateOne(
    { userId },
    { $set: { ...progressData, updatedAt: new Date() } },
    { upsert: true }
  )
  return result
}

/**
 * Update progress for a specific assignment
 */
export const updateAssignmentProgress = async (userId, assignmentId, progressData) => {
  const db = getMongoDB()
  const collection = db.collection(COLLECTION_NAME)
  const result = await collection.updateOne(
    { userId },
    {
      $set: {
        [`assignments.${assignmentId}`]: {
          ...progressData,
          updatedAt: new Date()
        },
        updatedAt: new Date()
      }
    },
    { upsert: true }
  )
  return result
}





