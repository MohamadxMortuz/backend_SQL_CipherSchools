/**
 * Sample Data Initialization
 * 
 * Creates pre-populated tables with sample data in workspace schemas
 */

/**
 * Initialize sample tables with data in a workspace schema
 */
export const initializeWorkspaceTables = async (client, schemaName) => {
  try {
    // Set search_path to the workspace schema
    await client.query(`SET search_path TO ${schemaName}, public`)
    
    // Create employees table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        department VARCHAR(50),
        salary DECIMAL(10, 2),
        hire_date DATE,
        manager_id INTEGER
      )
    `)
    
    // Check if employees table already has data
    const employeeCount = await client.query(`SELECT COUNT(*) FROM employees`)
    if (employeeCount.rows[0].count === '0') {
      // Insert sample employees data
      await client.query(`
        INSERT INTO employees (first_name, last_name, email, department, salary, hire_date, manager_id)
        VALUES
          ('John', 'Doe', 'john.doe@example.com', 'Engineering', 75000.00, '2020-01-15', NULL),
          ('Jane', 'Smith', 'jane.smith@example.com', 'Engineering', 80000.00, '2019-03-20', 1),
          ('Bob', 'Johnson', 'bob.johnson@example.com', 'Sales', 65000.00, '2021-06-10', NULL),
          ('Alice', 'Williams', 'alice.williams@example.com', 'Marketing', 70000.00, '2020-09-05', NULL),
          ('Charlie', 'Brown', 'charlie.brown@example.com', 'Engineering', 72000.00, '2021-02-14', 1),
          ('Diana', 'Davis', 'diana.davis@example.com', 'Sales', 68000.00, '2020-11-30', 3),
          ('Edward', 'Miller', 'edward.miller@example.com', 'HR', 60000.00, '2022-01-10', NULL),
          ('Fiona', 'Wilson', 'fiona.wilson@example.com', 'Marketing', 71000.00, '2021-04-22', 4)
      `)
    }
    
    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        price DECIMAL(10, 2) NOT NULL,
        stock_quantity INTEGER DEFAULT 0,
        supplier_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Check if products table already has data
    const productCount = await client.query(`SELECT COUNT(*) FROM products`)
    if (productCount.rows[0].count === '0') {
      // Insert sample products data
      await client.query(`
        INSERT INTO products (name, category, price, stock_quantity, supplier_id)
        VALUES
          ('Laptop Pro', 'Electronics', 1299.99, 45, 1),
          ('Wireless Mouse', 'Electronics', 29.99, 120, 1),
          ('Mechanical Keyboard', 'Electronics', 149.99, 80, 1),
          ('Office Chair', 'Furniture', 299.99, 30, 2),
          ('Desk Lamp', 'Furniture', 49.99, 100, 2),
          ('Notebook Set', 'Stationery', 12.99, 200, 3),
          ('Pen Set', 'Stationery', 8.99, 300, 3),
          ('Monitor 27"', 'Electronics', 399.99, 25, 1)
      `)
    }
    
    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        order_date DATE NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending'
      )
    `)
    
    // Check if orders table already has data
    const orderCount = await client.query(`SELECT COUNT(*) FROM orders`)
    if (orderCount.rows[0].count === '0') {
      // Insert sample orders data
      await client.query(`
        INSERT INTO orders (customer_id, product_id, quantity, order_date, total_amount, status)
        VALUES
          (1, 1, 2, '2024-01-15', 2599.98, 'completed'),
          (2, 3, 1, '2024-01-16', 149.99, 'completed'),
          (3, 5, 3, '2024-01-17', 149.97, 'pending'),
          (1, 2, 5, '2024-01-18', 149.95, 'completed'),
          (4, 8, 1, '2024-01-19', 399.99, 'shipped'),
          (2, 4, 2, '2024-01-20', 599.98, 'completed'),
          (5, 6, 10, '2024-01-21', 129.90, 'pending'),
          (3, 7, 20, '2024-01-22', 179.80, 'completed')
      `)
    }
    
    // Create customers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        city VARCHAR(50),
        country VARCHAR(50) DEFAULT 'USA',
        registration_date DATE
      )
    `)
    
    // Check if customers table already has data
    const customerCount = await client.query(`SELECT COUNT(*) FROM customers`)
    if (customerCount.rows[0].count === '0') {
      // Insert sample customers data
      await client.query(`
        INSERT INTO customers (name, email, city, country, registration_date)
        VALUES
          ('Acme Corp', 'contact@acme.com', 'New York', 'USA', '2020-01-10'),
          ('Tech Solutions', 'info@techsol.com', 'San Francisco', 'USA', '2019-05-15'),
          ('Global Industries', 'hello@global.com', 'Chicago', 'USA', '2021-03-20'),
          ('Digital Services', 'support@digital.com', 'Boston', 'USA', '2020-08-12'),
          ('Innovation Labs', 'contact@innolabs.com', 'Seattle', 'USA', '2022-01-05')
      `)
    }
    
    // Create departments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        location VARCHAR(100),
        budget DECIMAL(12, 2),
        head_count INTEGER
      )
    `)
    
    // Check if departments table already has data
    const deptCount = await client.query(`SELECT COUNT(*) FROM departments`)
    if (deptCount.rows[0].count === '0') {
      // Insert sample departments data
      await client.query(`
        INSERT INTO departments (name, location, budget, head_count)
        VALUES
          ('Engineering', 'Building A, Floor 3', 500000.00, 25),
          ('Sales', 'Building B, Floor 2', 300000.00, 15),
          ('Marketing', 'Building A, Floor 2', 250000.00, 12),
          ('HR', 'Building B, Floor 1', 150000.00, 8),
          ('Finance', 'Building A, Floor 1', 200000.00, 10)
      `)
    }
    
    console.log(`Sample tables initialized in workspace: ${schemaName}`)
    return true
  } catch (error) {
    console.error(`Error initializing workspace tables in ${schemaName}:`, error)
    throw error
  }
}

