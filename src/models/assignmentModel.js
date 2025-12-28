import { getMongoDB } from '../config/mongodb.js'
import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'assignments'

/**
 * Get all assignments
 */
export const getAllAssignments = async () => {
  const db = getMongoDB()
  const collection = db.collection(COLLECTION_NAME)
  const assignments = await collection.find({}).toArray()
  return assignments
}

/**
 * Get assignment by ID
 */
export const getAssignmentById = async (id) => {
  const db = getMongoDB()
  const collection = db.collection(COLLECTION_NAME)
  const assignment = await collection.findOne({ _id: id })
  return assignment
}

/**
 * Get assignment by MongoDB ObjectId string
 */
export const getAssignmentByObjectId = async (objectIdString) => {
  const db = getMongoDB()
  const collection = db.collection(COLLECTION_NAME)
  
  try {
    const assignment = await collection.findOne({ _id: new ObjectId(objectIdString) })
    return assignment
  } catch (error) {
    if (error.name === 'BSONTypeError' || error.message?.includes('ObjectId')) {
      return null
    }
    throw error
  }
}

