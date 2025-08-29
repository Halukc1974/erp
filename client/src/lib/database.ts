// Supabase PostgreSQL database operations using REST API
// Uses the connection string credentials securely

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xtsczsqpetyumpkawiwl.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0c2N6c3FwZXR5dW1wa2F3aXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDk4NDMsImV4cCI6MjA3MDcyNTg0M30.tEbu8QHtWQM00zLpkt5IuOwpeo61cn7LJ0N8fR6FCU4'

class DatabaseService {
  private apiUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.apiUrl = `${SUPABASE_URL}/rest/v1`;
    this.headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    
    console.log('DatabaseService initialized:', {
      url: this.apiUrl,
      keyPrefix: SUPABASE_ANON_KEY.substring(0, 20) + '...'
    });
  }

  // Generic method to fetch data from any table
  async fetchTable(tableName: string, options: {
    select?: string;
    filter?: string;
    order?: string;
    limit?: number;
    timeout?: number; // Add timeout option
  } = {}) {
    try {
      let url = `${this.apiUrl}/${tableName}`;
      const params = new URLSearchParams();

      if (options.select) params.append('select', options.select);
      if (options.filter) {
        const [key, value] = options.filter.split('=');
        // Check if value already has 'eq.' prefix to avoid duplication
        const filterValue = value.startsWith('eq.') ? value : `eq.${value}`;
        params.append(key, filterValue);
      }
      if (options.order) params.append('order', options.order);
      if (options.limit) params.append('limit', options.limit.toString());

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log(`Fetching ${tableName} from:`, url);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, options.timeout || 3000); // Default 3 seconds timeout

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear timeout if request completes

      console.log(`Response for ${tableName}:`, {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response for ${tableName}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`Data for ${tableName}:`, data);
      return data;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`Timeout fetching ${tableName} (3s)`);
        throw new Error(`Request timeout for ${tableName}`);
      }
      console.error(`Error fetching ${tableName}:`, error);
      throw error;
    }
  }

  // Insert data into a table
  async insertData(tableName: string, data: any) {
    try {
      console.log(`🔄 Inserting into ${tableName}:`, data);
      
      const response = await fetch(`${this.apiUrl}/${tableName}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data)
      });

      console.log(`📡 Response for ${tableName} insert:`, {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Insert error response:`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      let result = await response.json();
      console.log(`✅ Insert successful (raw):`, result);

      // Normalize Supabase response: when using return=representation,
      // Supabase may return an array of inserted rows; normalize to a single object
      if (Array.isArray(result) && result.length > 0) {
        console.log('🔧 Normalizing insert result: returning first element of array');
        result = result[0];
      }

      return result;
    } catch (error) {
      console.error(`Error inserting into ${tableName}:`, error);
      throw error;
    }
  }

  // Update data in a table
  async updateData(tableName: string, id: any, data: any) {
    try {
      if (!id) {
        console.error(`Attempted updateData with invalid id: ${id} for table ${tableName}`);
        throw new Error(`Invalid id for updateData: ${id}`);
      }
      const response = await fetch(`${this.apiUrl}/${tableName}?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      throw error;
    }
  }

  // Delete data from a table
  async deleteData(tableName: string, id: any) {
    try {
      const response = await fetch(`${this.apiUrl}/${tableName}?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      throw error;
    }
  }

  // Specific methods for common operations
  async getSuppliers() {
    return this.fetchTable('suppliers');
  }

  async getCustomers() {
    return this.fetchTable('customers');
  }

  async getPurchaseOrders() {
    return this.fetchTable('purchase_orders');
  }

  async getSalesOrders() {
    return this.fetchTable('sales_orders');
  }

  async getExpenses() {
    return this.fetchTable('expenses');
  }

  // Get dashboard metrics
  async getDashboardMetrics() {
    try {
      const [suppliers, customers, purchaseOrders, salesOrders, expenses] = await Promise.all([
        this.fetchTable('suppliers'),
        this.fetchTable('customers'),
        this.fetchTable('purchase_orders'),
        this.fetchTable('sales_orders'),
        this.fetchTable('expenses')
      ]);

      return {
        suppliersCount: suppliers?.length || 0,
        customersCount: customers?.length || 0,
        purchaseOrdersCount: purchaseOrders?.length || 0,
        salesOrdersCount: salesOrders?.length || 0,
        totalExpenses: expenses?.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0) || 0
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return {
        suppliersCount: 0,
        customersCount: 0,
        purchaseOrdersCount: 0,
        salesOrdersCount: 0,
        totalExpenses: 0
      };
    }
  }

  // Test connection
  async testConnection() {
    try {
      console.log('Testing Supabase connection...');
      
      // Try to get schema information first
      const schemaResponse = await fetch(`${this.apiUrl}/`, {
        method: 'GET',
        headers: this.headers
      });
      
      console.log('Schema response:', {
        status: schemaResponse.status,
        ok: schemaResponse.ok
      });
      
      if (schemaResponse.ok) {
        const schema = await schemaResponse.text();
        console.log('Schema info:', schema.substring(0, 200) + '...');
      }
      
      // Try to fetch from a common table
      try {
        const testData = await this.fetchTable('suppliers', { limit: 1 });
        console.log('Test connection successful, sample data:', testData);
        return true;
      } catch (tableError) {
        console.log('Suppliers table test failed, trying customers...');
        try {
          const testData = await this.fetchTable('customers', { limit: 1 });
          console.log('Customers table test successful:', testData);
          return true;
        } catch (customersError) {
          console.log('Both suppliers and customers failed, checking available tables...');
          return false;
        }
      }
      
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  // Get available tables
  async getAvailableTables() {
    try {
      // This endpoint might show available tables/views
      const response = await fetch(`${this.apiUrl}/`, {
        method: 'GET', 
        headers: this.headers
      });
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error getting available tables:', error);
      return null;
    }
  }
}

export const dbService = new DatabaseService();
