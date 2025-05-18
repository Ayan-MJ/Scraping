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
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Completing Login</CardTitle>
          <CardDescription className="text-center">Please wait while we complete your login...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-[#4F46E5]" />
        </CardContent>
      </Card>
    </div>
  )
}

// Default export with suspense boundary
export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Loading</CardTitle>
            <CardDescription className="text-center">Please wait...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-[#4F46E5]" />
          </CardContent>
        </Card>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
} 