import dotenv from 'dotenv'
import { connectMongoDB, getMongoDB } from './src/config/mongodb.js'

dotenv.config()

async function seedAssignments() {
  try {
    await connectMongoDB()
    const db = getMongoDB()
    const collection = db.collection('assignments')

    // Check if assignments already exist
    const count = await collection.countDocuments()
    if (count > 0) {
      console.log(`✓ Assignments already exist (${count} found). Skipping seed.`)
      process.exit(0)
    }

    // Sample assignments
    const assignments = [
      {
        title: 'Introduction to SELECT',
        description: 'Learn how to retrieve data from tables using the SELECT statement',
        difficulty: 'beginner',
        schema: 'public.students',
        question: 'Write a query to retrieve the first name and last name of all students',
        expectedOutput: 'List of student names',
        hints: [
          'You need to use the SELECT statement',
          'Look at the students table columns',
          'Use the wildcard (*) to get all columns or specify column names'
        ],
        correctQuery: 'SELECT first_name, last_name FROM students',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'WHERE Clause Filtering',
        description: 'Master filtering data with the WHERE clause',
        difficulty: 'beginner',
        schema: 'public.employees',
        question: 'Find all employees in the Sales department',
        expectedOutput: 'List of employees filtered by department',
        hints: [
          'Use the WHERE clause to filter results',
          'The department column contains department information',
          'Use = operator to match the exact department name'
        ],
        correctQuery: 'SELECT * FROM employees WHERE department = \'Sales\'',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'JOIN Two Tables',
        description: 'Learn to combine data from multiple tables using JOIN',
        difficulty: 'intermediate',
        schema: 'public.orders',
        question: 'Get the order details along with customer names',
        expectedOutput: 'Orders with associated customer information',
        hints: [
          'You need to use a JOIN to combine tables',
          'Look for a relationship between orders and customers table',
          'Consider using INNER JOIN for matching records',
          'Match on customer_id'
        ],
        correctQuery: 'SELECT o.*, c.name FROM orders o INNER JOIN customers c ON o.customer_id = c.id',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'GROUP BY and Aggregation',
        description: 'Aggregate data and group results by columns',
        difficulty: 'intermediate',
        schema: 'public.sales',
        question: 'Calculate total sales amount by region',
        expectedOutput: 'Regions with their total sales',
        hints: [
          'Use GROUP BY to organize data by region',
          'Use SUM() function to calculate total sales',
          'Group by the region column',
          'Consider sorting results by total amount'
        ],
        correctQuery: 'SELECT region, SUM(amount) as total_sales FROM sales GROUP BY region ORDER BY total_sales DESC',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Subqueries',
        description: 'Write nested queries to solve complex problems',
        difficulty: 'advanced',
        schema: 'public.products',
        question: 'Find products that cost more than the average price',
        expectedOutput: 'Products above average price',
        hints: [
          'Use a subquery to calculate the average price',
          'Use the subquery result in the WHERE clause',
          'Compare each product price with the average',
          'Consider naming the subquery result'
        ],
        correctQuery: 'SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products)',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Insert assignments
    const result = await collection.insertMany(assignments)
    console.log(`✓ Seeded ${result.insertedIds.length} assignments successfully`)
    console.log('Created assignments:')
    assignments.forEach((a, i) => {
      console.log(`  ${i + 1}. ${a.title} (${a.difficulty})`)
    })
  } catch (error) {
    console.error('Error seeding assignments:', error.message)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

seedAssignments()
