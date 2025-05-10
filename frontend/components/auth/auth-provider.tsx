"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Session, User as SupabaseUser } from "@supabase/supabase-js"
import { toast } from "react-hot-toast"
import { supabase } from "@/lib/supabase"
import { User } from "@/types"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
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
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
    <AuthContext.Provider value={{ user, session, isLoading, login, signup, logout }}>
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