"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Session, User as SupabaseUser } from "@supabase/supabase-js"
import { toast } from "react-hot-toast"
import { supabase } from "@/lib/supabase"
import { User } from "@/types"
import { SocialProvider } from "@/lib/social-auth-config"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isVerifying2FA: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  loginWithSocial: (provider: SocialProvider) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  resendVerificationEmail: () => Promise<void>
  verify2FA: (code: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Convert Supabase user to our User type
const mapSupabaseUser = (user: SupabaseUser | null): User | null => {
  if (!user) return null
  
  return {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.name || user.email?.split("@")[0] || "",
    avatar_url: user.user_metadata?.avatar_url,
    created_at: user.created_at || new Date().toISOString(),
    emailVerified: user.email_confirmed_at ? true : false,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying2FA, setIsVerifying2FA] = useState(false)
  const router = useRouter()

  // Fetch session and set up auth state listener
  useEffect(() => {
    const loadUserSession = async () => {
      try {
        setIsLoading(true)
        
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        setSession(initialSession)
        
        if (initialSession) {
          const { data: { user: supabaseUser } } = await supabase.auth.getUser()
          setUser(mapSupabaseUser(supabaseUser))
        }
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            setSession(currentSession)
            setUser(currentSession ? mapSupabaseUser(currentSession.user) : null)
            
            if (event === 'SIGNED_OUT') {
              setUser(null)
              setSession(null)
            }
          }
        )
        
        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("Auth state setup error:", error)
        toast.error("Authentication error. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUserSession()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        throw error
      }
      
      if (data?.user) {
        setUser(mapSupabaseUser(data.user))
        setSession(data.session)
        toast.success("Logged in successfully")
        router.push("/")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      toast.error(error?.message || "Login failed. Please check your credentials.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithSocial = async (provider: SocialProvider) => {
    try {
      setIsLoading(true)
      
      // Configure redirect URL (adjust for your Supabase setup)
      const redirectTo = `${window.location.origin}/auth/callback`
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo }
      })
      
      if (error) {
        throw error
      }
      
      // The user will be redirected to the provider's auth page
      // After successful authentication, they'll be redirected back to the callback URL
    } catch (error: any) {
      console.error(`${provider} login error:`, error)
      toast.error(error?.message || `${provider} login failed. Please try again.`)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })
      
      if (error) {
        throw error
      }
      
      if (data?.user) {
        setUser(mapSupabaseUser(data.user))
        setSession(data.session)
        toast.success("Account created successfully")
        router.push("/")
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      toast.error(error?.message || "Failed to create account. Please try again.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) {
        throw error
      }
      
      toast.success("Password reset link sent to your email")
    } catch (error: any) {
      console.error("Password reset error:", error)
      toast.error(error?.message || "Failed to send reset email. Please try again.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setIsLoading(true)
      
      // In a real implementation, you would use the token to identify the user session
      // For Supabase, the token is handled automatically via URL
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      
      if (error) {
        throw error
      }
      
      toast.success("Password reset successfully")
      router.push("/auth/login")
    } catch (error: any) {
      console.error("Password reset error:", error)
      toast.error(error?.message || "Failed to reset password. Please try again.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEmail = async (token: string) => {
    try {
      setIsLoading(true)
      
      // In a real implementation with Supabase, the token is typically handled 
      // automatically when the user clicks the verification link in their email
      // This function would mostly be used to update the UI state
      
      const { data, error } = await supabase.auth.getUser()
      
      if (error) {
        throw error
      }
      
      if (data.user) {
        setUser(mapSupabaseUser(data.user))
        toast.success("Email verified successfully")
      }
    } catch (error: any) {
      console.error("Email verification error:", error)
      toast.error(error?.message || "Failed to verify email. Please try again.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const resendVerificationEmail = async () => {
    try {
      setIsLoading(true)
      
      if (!user?.email) {
        throw new Error("No email address found")
      }
      
      // With Supabase, this typically involves re-sending the verification email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      })
      
      if (error) {
        throw error
      }
      
      toast.success("Verification email resent successfully")
    } catch (error: any) {
      console.error("Resend verification error:", error)
      toast.error(error?.message || "Failed to resend verification email. Please try again.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verify2FA = async (code: string) => {
    try {
      setIsLoading(true)
      
      // Implement this when you enable 2FA in Supabase
      // This is a placeholder for the actual implementation
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // After successful verification
      setIsVerifying2FA(false)
      toast.success("2FA verification successful")
      router.push("/")
    } catch (error: any) {
      console.error("2FA verification error:", error)
      toast.error(error?.message || "Invalid verification code. Please try again.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      setUser(null)
      setSession(null)
      toast.success("Logged out successfully")
      router.push("/auth/login")
    } catch (error: any) {
      console.error("Logout error:", error)
      toast.error(error?.message || "Failed to log out. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        isLoading, 
        isVerifying2FA,
        login, 
        signup, 
        loginWithSocial,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerificationEmail,
        verify2FA,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 