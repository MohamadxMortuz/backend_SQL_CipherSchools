import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Import routes
import routes from './routes/index.js'

// Import database connections
import { connectPostgreSQL } from './config/postgres.js'
import { connectMongoDB } from './config/mongodb.js'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'CipherSQLStudio API is running',
    timestamp: new Date().toISOString()
  })
})

// API routes
app.use('/api', routes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  
  // Initialize database connections
  try {
    await connectPostgreSQL()
    console.log('✓ PostgreSQL connected')
  } catch (error) {
    console.error('✗ PostgreSQL connection error:', error.message)
    console.log('Continuing without PostgreSQL...')
  }
  
  try {
    await connectMongoDB()
    console.log('✓ MongoDB connected')
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message)
    console.log('Continuing without MongoDB...')
  }
})

export default app

