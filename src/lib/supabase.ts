import { createClient } from '@supabase/supabase-js'
import type { Resource } from './types'
import { envValidator } from './env'

const { url: supabaseUrl, anonKey: supabaseAnonKey } = envValidator.getSupabaseConfig()

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Re-export types for convenience
export type { Resource }