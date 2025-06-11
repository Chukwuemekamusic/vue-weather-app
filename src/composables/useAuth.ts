import type { User } from '@supabase/supabase-js'
import type { AuthError } from '@/types/auth'
// composables/useAuth.ts
import { ref, type Ref } from 'vue'
import { supabase } from '@/lib/supabase'

interface UseAuthReturn {
  user: Ref<User | null>
  loading: Ref<boolean>
  authError: Ref<AuthError | null>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  initAuth: () => void
}

const user = ref<User | null>(null)
const loading = ref<boolean>(true)
const authError = ref<AuthError | null>(null)

export const useAuth = (): UseAuthReturn => {
  const signInWithGoogle = async (): Promise<void> => {
    authError.value = null
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      })
      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error)
      authError.value = {
        message: error.message || 'Failed to sign in with Google.',
      }
      throw error
    }
  }

  const signOut = async (): Promise<void> => {
    authError.value = null
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      user.value = null
    } catch (error: any) {
      console.error('Error signing out:', error)
      authError.value = { message: error.message || 'Failed to sign out.' }
      throw error
    }
  }

  const signUpWithEmail = async (
    email: string,
    password: string,
  ): Promise<void> => {
    authError.value = null
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        throw error
      }
      if (data.user) {
        user.value = data.user
      }
    } catch (error: any) {
      console.error('Error signing up with email:', error)
      authError.value = { message: error.message || 'Failed to sign up' }
      throw error
    }
  }

  const signInWithEmail = async (
    email: string,
    password: string,
  ): Promise<void> => {
    authError.value = null
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        throw error
      }
      if (data.user) {
        user.value = data.user
      }
    } catch (error: any) {
      console.error('Error signing in with email:', error)
      authError.value = { message: error.message || 'Failed to sign in.' }
      throw error
    }
  }

  const initAuth = (): void => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
        authError.value = { message: error.message || 'Failed to get session' }
      }
      user.value = session?.user || null
      loading.value = false
    })

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user || null
      loading.value = false
      authError.value = null
    })
  }

  return {
    user,
    loading,
    authError,
    signInWithGoogle,
    signOut,
    signUpWithEmail,
    signInWithEmail,
    initAuth,
  }
}
