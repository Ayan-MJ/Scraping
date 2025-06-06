"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { SocialLoginButton } from "./_components/social-login-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

// Client component that uses useSearchParams
function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [processingProvider, setProcessingProvider] = useState<string | null>(null)
  const { login, loginWithSocial, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const resetSuccess = searchParams.get("reset") === "success"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    try {
      await login(email, password)
    } catch (err) {
      setError("Invalid email or password")
    }
  }

  const handleSocialLogin = async (provider: "github" | "gitlab" | "bitbucket") => {
    try {
      setProcessingProvider(provider)
      await loginWithSocial(provider)
    } catch (err) {
      setError(`Failed to login with ${provider}`)
    } finally {
      setProcessingProvider(null)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-secondary dark:bg-card">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resetSuccess && (
            <Alert className="mb-4 bg-green-50 border-green-200 text-green-700">
              <AlertDescription>
                Your password has been reset successfully. Please log in with your new password.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <SocialLoginButton
              provider="github"
              onClick={handleSocialLogin}
              isLoading={isLoading}
              isProcessing={processingProvider === "github"}
            />
            <SocialLoginButton
              provider="gitlab"
              onClick={handleSocialLogin}
              isLoading={isLoading}
              isProcessing={processingProvider === "gitlab"}
            />
            <SocialLoginButton
              provider="bitbucket"
              onClick={handleSocialLogin}
              isLoading={isLoading}
              isProcessing={processingProvider === "bitbucket"}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-border focus:border-primary focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-border focus:border-primary focus:ring-ring"
              />
            </div>
            {error && <div className="text-sm font-medium text-red-500">{error}</div>}
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-muted-foreground font-medium hover:text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

// Main page component with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4 bg-secondary dark:bg-card">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Loading</CardTitle>
            <CardDescription className="text-center">Please wait...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
} 