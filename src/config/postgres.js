import pg from 'pg'

const { Pool } = pg

let pool = null

/**
 * Initialize PostgreSQL connection pool
 */
export const connectPostgreSQL = async () => {
  try {
    pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB || 'cipher_sql_studio',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD ? String(process.env.POSTGRES_PASSWORD) : '',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    })

    // Test connection
    const client = await pool.connect()
    console.log('PostgreSQL connected successfully')
    client.release()

    return pool
  } catch (error) {
    console.error('PostgreSQL connection error:', error)
    throw error
  }
}

/**
 * Get PostgreSQL pool instance
 */
export const getPostgreSQLPool = () => {
  if (!pool) {
    throw new Error('PostgreSQL pool not initialized. Call connectPostgreSQL() first.')
  }
  return pool
}

/**
 * Close PostgreSQL connection pool
 */
export const closePostgreSQL = async () => {
  if (pool) {
    await pool.end()
    console.log('PostgreSQL connection closed')
  }
}


