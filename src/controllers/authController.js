import { createUser, findUserByEmail, verifyPassword } from '../models/userModel.js'
import { generateToken } from '../middleware/auth.js'

/**
 * Register a new user
 */
export const signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      })
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      })
    }
    
    // Create user
    try {
      const user = await createUser(email, password, name)
      
      // Generate token
      const token = generateToken(user._id.toString())
      
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name
          },
          token
        }
      })
    } catch (error) {
      if (error.message === 'User with this email already exists') {
        return res.status(409).json({
          success: false,
          error: error.message
        })
      }
      throw error
    }
  } catch (error) {
    next(error)
  }
}

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      })
    }
    
    // Find user
    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }
    
    // Generate token
    const token = generateToken(user._id.toString())
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name
        },
        token
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get current user
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    })
  } catch (error) {
    next(error)
  }
}




