"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Copy, RefreshCw, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { AccountSettings } from "@/app/account/settings/page"

interface ProfileSettingsProps {
  settings: AccountSettings
  onChange: (settings: Partial<AccountSettings>) => void
}

export function ProfileSettings({ settings, onChange }: ProfileSettingsProps) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const { toast } = useToast()

  const handleFullNameChange = (fullName: string) => {
    onChange({
      profile: {
        ...settings.profile,
        fullName,
      },
    })
  }

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setPasswordError("Current password is required")
      return
    }

    if (!newPassword) {
      setPasswordError("New password is required")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }

    setIsChangingPassword(true)
    setPasswordError("")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Password changed",
      description: "Your password has been updated successfully.",
    })

    setIsChangingPassword(false)
    setIsPasswordModalOpen(false)
    resetPasswordForm()
  }

  const resetPasswordForm = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setPasswordError("")
  }

  const handleRegenerateApiKey = async () => {
    setIsRegeneratingKey(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newApiKey = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

    onChange({
      profile: {
        ...settings.profile,
        apiKey: newApiKey,
      },
    })

    toast({
      title: "API key regenerated",
      description: "Your new API key has been generated. The old key is no longer valid.",
    })

    setIsRegeneratingKey(false)
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(settings.profile.apiKey)
    toast({
      title: "API key copied",
      description: "The API key has been copied to your clipboard.",
    })
  }

  const getMaskedApiKey = () => {
    if (showApiKey) {
      return settings.profile.apiKey
    }
    const prefix = settings.profile.apiKey.substring(0, 7)
    const suffix = settings.profile.apiKey.substring(settings.profile.apiKey.length - 4)
    return `${prefix}${"•".repeat(20)}${suffix}`
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[#4F46E5] mb-4">Profile Settings</h2>
        <p className="text-sm text-muted-foreground mb-6">Manage your personal information and account security.</p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="full-name">Full Name</Label>
          <Input
            id="full-name"
            value={settings.profile.fullName}
            onChange={(e) => handleFullNameChange(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" value={settings.profile.email} readOnly disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">
            Your email address is used for account login and notifications. Contact support to change your email.
          </p>
        </div>

        <div className="grid gap-2">
          <Label>Password</Label>
          <div>
            <Button
              variant="outline"
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-[#4F46E5] hover:text-[#4338CA]"
            >
              Change Password
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-medium">API Keys</h3>
          <p className="text-sm text-muted-foreground">
            Use this API key to access your account and data programmatically.
          </p>

          <div className="rounded-md border bg-muted/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="api-key" className="text-sm font-medium">
                API Key
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="h-8 px-2"
                  title={showApiKey ? "Hide API Key" : "Show API Key"}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCopyApiKey} className="h-8 px-2">
                  <Copy className="mr-1 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerateApiKey}
                  disabled={isRegeneratingKey}
                  className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                >
                  <RefreshCw className="mr-1 h-4 w-4" />
                  {isRegeneratingKey ? "Regenerating..." : "Regenerate"}
                </Button>
              </div>
            </div>
            <div className="bg-muted p-2 rounded-md font-mono text-xs overflow-x-auto">{getMaskedApiKey()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Keep this key secret. Regenerating will invalidate the old key.
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={(open) => !isChangingPassword && setIsPasswordModalOpen(open)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
              />
            </div>
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPasswordModalOpen(false)
                resetPasswordForm()
              }}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="bg-[#4F46E5] hover:bg-[#4338CA]"
            >
              {isChangingPassword ? "Saving..." : "Save Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
