import { getMongoDB } from '../config/mongodb.js'

/**
 * Seed sample assignments into MongoDB
 */
export const seedAssignments = async () => {
  const db = getMongoDB()
  const collection = db.collection('assignments')
  
  const assignments = [
    {
      title: 'Introduction to SELECT',
      description: 'Learn the basics of retrieving data from tables',
      question: 'Write a SQL query to select all columns from the employees table.',
      difficulty: 'beginner',
      expectedQuery: 'SELECT * FROM employees;',
      hints: [
        'Use the SELECT statement to retrieve data',
        'The asterisk (*) selects all columns',
        'Don\'t forget the semicolon at the end'
      ]
    },
    {
      title: 'Filtering with WHERE',
      description: 'Learn how to filter rows based on conditions',
      question: 'Write a query to find all employees in the Engineering department.',
      difficulty: 'beginner',
      expectedQuery: 'SELECT * FROM employees WHERE department = \'Engineering\';',
      hints: [
        'Use the WHERE clause to filter rows',
        'Check the department column',
        'Use single quotes for string values'
      ]
    },
    {
      title: 'Sorting Results',
      description: 'Learn how to order query results',
      question: 'Write a query to get all employees sorted by salary in descending order.',
      difficulty: 'beginner',
      expectedQuery: 'SELECT * FROM employees ORDER BY salary DESC;',
      hints: [
        'Use ORDER BY to sort results',
        'DESC means descending order',
        'You can sort by any column'
      ]
    },
    {
      title: 'Joining Tables',
      description: 'Learn how to combine data from multiple tables',
      question: 'Write a query to get employee names along with their department names. Join employees with departments.',
      difficulty: 'intermediate',
      expectedQuery: 'SELECT e.first_name, e.last_name, d.name FROM employees e JOIN departments d ON e.department = d.name;',
      hints: [
        'Use JOIN to combine tables',
        'You need to specify the join condition',
        'Use table aliases to make queries cleaner'
      ]
    },
    {
      title: 'Aggregate Functions',
      description: 'Learn how to calculate summary statistics',
      question: 'Write a query to find the average salary for each department.',
      difficulty: 'intermediate',
      expectedQuery: 'SELECT department, AVG(salary) as avg_salary FROM employees GROUP BY department;',
      hints: [
        'Use aggregate functions like AVG, SUM, COUNT',
        'GROUP BY is needed when using aggregates',
        'You can give columns aliases with AS'
      ]
    },
    {
      title: 'Complex WHERE Conditions',
      description: 'Learn advanced filtering techniques',
      question: 'Write a query to find employees with salary greater than 70000 and hired after 2020.',
      difficulty: 'intermediate',
      expectedQuery: 'SELECT * FROM employees WHERE salary > 70000 AND hire_date > \'2020-01-01\';',
      hints: [
        'You can combine multiple conditions with AND',
        'Date comparisons work with standard operators',
        'Use the correct date format'
      ]
    },
    {
      title: 'Subqueries',
      description: 'Learn how to use nested queries',
      question: 'Write a query to find employees who earn more than the average salary.',
      difficulty: 'advanced',
      expectedQuery: 'SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);',
      hints: [
        'A subquery can be used in the WHERE clause',
        'The subquery calculates the average first',
        'Parentheses are important for subqueries'
      ]
    }
  ]
  
  // Clear existing assignments (optional)
  // await collection.deleteMany({})
  
  // Insert assignments
  const result = await collection.insertMany(assignments)
  console.log(`Seeded ${result.insertedCount} assignments`)
  
  return result
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAssignments()
    .then(() => {
      console.log('Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}




