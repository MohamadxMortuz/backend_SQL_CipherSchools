import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

async function setupDatabase() {
  const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
  })

  try {
    const client = await pool.connect()
    
    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      ['cipher_sql_studio']
    )
    
    if (result.rows.length === 0) {
      console.log('Creating database cipher_sql_studio...')
      await client.query('CREATE DATABASE cipher_sql_studio')
      console.log('✓ Database created successfully')
    } else {
      console.log('✓ Database cipher_sql_studio already exists')
    }
    
    client.release()
  } catch (error) {
    console.error('Error setting up database:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

setupDatabase()
