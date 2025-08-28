import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xtsczsqpetyumpkawiwl.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0c2N6c3FwZXR5dW1wa2F3aXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDk4NDMsImV4cCI6MjA3MDcyNTg0M30.tEbu8QHtWQM00zLpkt5IuOwpeo61cn7LJ0N8fR6FCU4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password })
  },
  
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  },
  
  signOut: async () => {
    return await supabase.auth.signOut()
  },
  
  getUser: async () => {
    return await supabase.auth.getUser()
  },
  
  getSession: async () => {
    return await supabase.auth.getSession()
  },
  
  onAuthStateChange: (callback: (event: any, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}
