import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our database
export type Resource = {
  id: string
  created_at: string
  title: string
  description: string
  tags: string[]
  category: string
  url: string
  eligibility: string | null
  deadline: string | null
  featured: boolean
}