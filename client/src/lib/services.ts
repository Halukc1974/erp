import { supabase } from './supabase'

// Accounts
export const accountsService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('isActive', true)
      .order('code')
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  create: async (account: any) => {
    const { data, error } = await supabase
      .from('accounts')
      .insert(account)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, account: any) => {
    const { data, error } = await supabase
      .from('accounts')
      .update(account)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Customers
export const customersService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('isActive', true)
      .order('name')
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  create: async (customer: any) => {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, customer: any) => {
    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Suppliers  
export const suppliersService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name')
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  create: async (supplier: any) => {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, supplier: any) => {
    const { data, error } = await supabase
      .from('suppliers')
      .update(supplier)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Journal Entries
export const journalService = {
  getAll: async (limit = 100) => {
    const { data, error } = await supabase
      .from('journalEntries')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('journalEntries')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  create: async (entry: any) => {
    const { data, error } = await supabase
      .from('journalEntries')
      .insert(entry)
      .select()
      .single()
    return { data, error }
  }
}
