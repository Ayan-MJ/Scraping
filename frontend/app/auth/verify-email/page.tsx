"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, Mail, ArrowRight } from "lucide-react"

export default function VerifyEmailPage() {
  const [error, setError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { user, verifyEmail, resendVerificationEmail, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get("token")

  useEffect(() => {
    if (token) {
      setIsVerifying(true)
      verifyEmail(token).catch((err) => {
        setError("Invalid or expired verification link. Please request a new one.")
        setIsVerifying(false)
      })
    }
  }, [token, verifyEmail])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false)
    }
  }, [countdown, resendDisabled])

  const handleResendEmail = async () => {
    setError("")
    try {
      await resendVerificationEmail()
      setResendDisabled(true)
      setCountdown(60) // Disable resend for 60 seconds
    } catch (err) {
      setError("Failed to resend verification email. Please try again.")
    }
  }

  if (!user) {
    router.push("/auth/login")
    return null
  }

  if (user.emailVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Email Verified</CardTitle>
            <CardDescription className="text-center">Your email has been successfully verified.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push("/dashboard")} className="bg-[#4F46E5] hover:bg-[#4338CA]">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Mail className="h-16 w-16 text-[#4F46E5]" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification link to <strong>{user.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Please check your email and click on the verification link to verify your account.
                </p>
              </div>
            </div>
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Didn't receive the email? Check your spam folder or click below to resend.
            </p>
            <Button
              onClick={handleResendEmail}
              disabled={isLoading || resendDisabled}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : resendDisabled ? (
                `Resend in ${countdown}s`
              ) : (
                "Resend Verification Email"
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/auth/login" className="text-sm text-[#6B7280] hover:text-[#4F46E5]">
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
} 