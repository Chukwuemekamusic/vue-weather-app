// src/types/auth.ts
import type { User } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  loading: boolean
}

export interface UserMetadata {
  avatar_url?: string
  full_name?: string
  email?: string
}

export interface AuthError {
  message: string
  status?: number
}
