"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ShieldCheck } from "lucide-react"

export default function TwoFactorVerifyPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { verify2FA, isLoading, isVerifying2FA } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isVerifying2FA) {
      router.push("/auth/login")
    }
  }, [isVerifying2FA, router])

  useEffect(() => {
    // Focus the first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste event
      const pastedValue = value.slice(0, 6).split("")
      const newCode = [...code]

      pastedValue.forEach((char, i) => {
        if (i + index < 6) {
          newCode[i + index] = char
        }
      })

      setCode(newCode)

      // Focus the appropriate input
      const focusIndex = Math.min(index + pastedValue.length, 5)
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus()
      }
    } else {
      // Handle single character input
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)

      // Auto-focus next input
      if (value && index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const verificationCode = code.join("")

    if (verificationCode.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    try {
      await verify2FA(verificationCode)
    } catch (err) {
      setError("Invalid verification code. Please try again.")
      // Clear the code and focus the first input
      setCode(["", "", "", "", "", ""])
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus()
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-16 w-16 text-[#4F46E5]" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-center">Enter the 6-digit code from your authenticator app</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center space-x-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5]"
                />
              ))}
            </div>
            {error && <div className="text-sm font-medium text-red-500 text-center">{error}</div>}
            <Button type="submit" className="w-full bg-[#4F46E5] hover:bg-[#4338CA]" disabled={isLoading}>
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
  )
} 