"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ShieldCheck } from "lucide-react"
import { Suspense } from "react"

export default function TwoFactorVerifyPage() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const { verify2FA, isLoading, user, logout, isVerifying2FA } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isVerifying2FA) {
      router.push("/auth/login")
    }
  }, [isVerifying2FA, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (code.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    try {
      await verify2FA(code)
    } catch (err) {
      setError("Invalid verification code. Please try again.")
      // Clear the code
      setCode("")
    }
  }

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Loading</CardTitle>
            <CardDescription className="text-center">Please wait...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
          </CardContent>
        </Card>
      </div>
    }>
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <ShieldCheck className="h-16 w-16 text-brand-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Two-Factor Authentication</CardTitle>
            <CardDescription className="text-center">Enter the 6-digit code from your authenticator app</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center space-x-2">
                <InputOTP maxLength={6} value={code} onChange={setCode}>
                  <InputOTPGroup>
                    {[...Array(6)].map((_, index) => (
                      <InputOTPSlot 
                        key={index} 
                        index={index} 
                        className="w-12 h-12 text-center text-lg border-gray-300 focus:border-brand-primary focus:ring-brand-primary"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && <div className="text-sm font-medium text-red-500">{error}</div>}
              <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary-hover text-brand-primary-foreground" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">Having trouble? Contact support for assistance.</p>
          </CardFooter>
        </Card>
      </div>
    </Suspense>
  )
} 