import jwt from 'jsonwebtoken'
import { findUserById } from '../models/userModel.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

/**
 * Generate JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Authentication middleware
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid token.'
      })
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      })
    }
    
    // Verify user still exists
    const user = await findUserById(decoded.userId)
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      })
    }
    
    // Attach user info to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    }
    
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    })
  }
}

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = verifyToken(token)
      
      if (decoded) {
        const user = await findUserById(decoded.userId)
        if (user) {
          req.user = {
            id: user._id.toString(),
            email: user.email,
            name: user.name
          }
        }
      }
    }
    
    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}




