"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Suspense } from "react"

// Create a client component wrapper for the callback handler
function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // This effect will run when the page is loaded after OAuth redirect
    const handleCallback = async () => {
      try {
        // The hash containing the access token will be automatically handled by Supabase
        const { error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }
        
        // Redirect to dashboard on success
        router.push("/dashboard")
      } catch (error) {
        console.error("Auth callback error:", error)
        router.push("/auth/login?error=social_auth_failed")
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-secondary dark:bg-card">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Processing Authentication</CardTitle>
          <CardDescription>Please wait while we securely log you in.</CardDescription>
        </CardHeader>
        <CardContent>
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        </CardContent>
      </Card>
    </div>
  )
}

// Default export with suspense boundary
export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4 bg-secondary dark:bg-card">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Loading</CardTitle>
            <CardDescription>Please wait...</CardDescription>
          </CardHeader>
          <CardContent>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          </CardContent>
        </Card>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
} 