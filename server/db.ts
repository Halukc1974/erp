import { Pool } from 'pg'

// Direct PostgreSQL connection using your connection string
const connectionString = 'postgresql://postgres.xtsczsqpetyumpkawiwl:A1s1d1f1a1s1d1f1!@aws-0-us-east-1.pooler.supabase.com:5432/postgres'

export const db = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
})

// Test connection
db.on('connect', () => {
  console.log('Connected to PostgreSQL database')
})

db.on('error', (err) => {
  console.error('PostgreSQL connection error:', err)
})

// Database helper functions
export const dbHelpers = {
  // Execute any SQL query
  async query(text: string, params?: any[]) {
    const client = await db.connect()
    try {
      const result = await client.query(text, params)
      return result.rows
    } finally {
      client.release()
    }
  },

  // Get all tables
  async getTables() {
    return this.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
  },

  // Get table data
  async getTableData(tableName: string, limit = 100) {
    return this.query(`SELECT * FROM ${tableName} LIMIT $1`, [limit])
  },

  // Specific business queries
  async getSuppliers() {
    return this.query('SELECT * FROM suppliers ORDER BY name')
  },

  async getCustomers() {
    return this.query('SELECT * FROM customers ORDER BY name')
  },

  async getPurchaseOrders() {
    return this.query('SELECT * FROM purchase_orders ORDER BY created_at DESC')
  },

  async getSalesOrders() {
    return this.query('SELECT * FROM sales_orders ORDER BY created_at DESC')
  },

  async getDashboardStats() {
    const queries = [
      'SELECT COUNT(*) as count FROM suppliers',
      'SELECT COUNT(*) as count FROM customers', 
      'SELECT COUNT(*) as count FROM purchase_orders',
      'SELECT COUNT(*) as count FROM sales_orders',
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses'
    ]

    const results = await Promise.all(
      queries.map(query => this.query(query))
    )

    return {
      suppliersCount: results[0][0]?.count || 0,
      customersCount: results[1][0]?.count || 0,
      purchaseOrdersCount: results[2][0]?.count || 0,
      salesOrdersCount: results[3][0]?.count || 0,
      totalExpenses: results[4][0]?.total || 0
    }
  }
}
