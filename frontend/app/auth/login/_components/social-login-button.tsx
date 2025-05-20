"use client"

import { Button } from "@/components/ui/button"
import { SocialProvider, socialAuthConfig } from "@/lib/social-auth-config"
import { Loader2 } from "lucide-react"
import type { ComponentProps } from "react"

interface SocialLoginButtonProps extends Omit<ComponentProps<typeof Button>, "onClick"> {
  provider: SocialProvider
  isLoading?: boolean
  isProcessing?: boolean
  onClick?: (provider: SocialProvider) => void
  useDirectAuth?: boolean
}

export const SocialLoginButton = ({
  provider,
  isLoading,
  isProcessing,
  onClick,
  useDirectAuth,
  ...props
}: SocialLoginButtonProps) => {
  const config = socialAuthConfig[provider]
  const Icon = config.icon

  const handleClick = () => {
    if (onClick) {
      onClick(provider)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 transition-colors"
      style={{
        borderColor: isLoading || isProcessing ? undefined : `${config.color}40`,
        color: isLoading || isProcessing ? undefined : config.color,
      }}
      onClick={handleClick}
      disabled={isLoading || isProcessing}
      {...props}
    >
      {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
      Continue with {config.name}
    </Button>
  )
} 