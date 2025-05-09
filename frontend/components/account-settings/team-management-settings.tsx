"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RefreshCw, Trash2, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { AccountSettings } from "@/app/account/settings/page"

interface TeamManagementSettingsProps {
  settings: AccountSettings
  onChange: (settings: Partial<AccountSettings>) => void
}

export function TeamManagementSettings({ settings, onChange }: TeamManagementSettingsProps) {
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"viewer" | "editor" | "admin">("viewer")
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const [isResendingInvite, setIsResendingInvite] = useState<string | null>(null)
  const [isRevokingInvite, setIsRevokingInvite] = useState<string | null>(null)
  const [isRemovingMember, setIsRemovingMember] = useState<string | null>(null)
  const [confirmRemoveDialogOpen, setConfirmRemoveDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleSendInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsSendingInvite(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newInvite = {
      id: `invite-${Date.now()}`,
      email: inviteEmail,
      role: inviteRole,
      sentAt: new Date(),
    }

    onChange({
      team: {
        ...settings.team,
        pendingInvites: [...settings.team.pendingInvites, newInvite],
      },
    })

    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${inviteEmail}.`,
    })

    setIsSendingInvite(false)
    setInviteEmail("")
  }

  const handleResendInvite = async (inviteId: string) => {
    setIsResendingInvite(inviteId)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const updatedInvites = settings.team.pendingInvites.map((invite) =>
      invite.id === inviteId ? { ...invite, sentAt: new Date() } : invite,
    )

    onChange({
      team: {
        ...settings.team,
        pendingInvites: updatedInvites,
      },
    })

    toast({
      title: "Invitation resent",
      description: "The invitation has been resent successfully.",
    })

    setIsResendingInvite(null)
  }

  const handleRevokeInvite = async (inviteId: string) => {
    setIsRevokingInvite(inviteId)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const updatedInvites = settings.team.pendingInvites.filter((invite) => invite.id !== inviteId)

    onChange({
      team: {
        ...settings.team,
        pendingInvites: updatedInvites,
      },
    })

    toast({
      title: "Invitation revoked",
      description: "The invitation has been revoked successfully.",
    })

    setIsRevokingInvite(null)
  }

  const handleChangeRole = (memberId: string, role: "viewer" | "editor" | "admin") => {
    const updatedMembers = settings.team.members.map((member) =>
      member.id === memberId ? { ...member, role } : member,
    )

    onChange({
      team: {
        ...settings.team,
        members: updatedMembers,
      },
    })

    toast({
      title: "Role updated",
      description: "The team member's role has been updated successfully.",
    })
  }

  const handleRemoveMember = async () => {
    if (!isRemovingMember) return

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const updatedMembers = settings.team.members.filter((member) => member.id !== isRemovingMember)

    onChange({
      team: {
        ...settings.team,
        members: updatedMembers,
      },
    })

    toast({
      title: "Member removed",
      description: "The team member has been removed successfully.",
    })

    setIsRemovingMember(null)
    setConfirmRemoveDialogOpen(false)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[#4F46E5] mb-4">Team Management</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Invite team members and manage their access to your account.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-base font-medium">Invite New Member</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="invite-email" className="sr-only">
                Email
              </Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email address"
              />
            </div>
            <div className="w-full sm:w-40">
              <Label htmlFor="invite-role" className="sr-only">
                Role
              </Label>
              <Select
                value={inviteRole}
                onValueChange={(value) => setInviteRole(value as "viewer" | "editor" | "admin")}
              >
                <SelectTrigger id="invite-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSendInvite}
              disabled={!inviteEmail || isSendingInvite}
              className="bg-[#4F46E5] hover:bg-[#4338CA]"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {isSendingInvite ? "Sending..." : "Send Invite"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-medium">Pending Invitations</h3>
          {settings.team.pendingInvites.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-muted/20">
              <p className="text-muted-foreground">No pending invitations</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.team.pendingInvites.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">{invite.email}</TableCell>
                      <TableCell className="capitalize">{invite.role}</TableCell>
                      <TableCell>{formatDate(invite.sentAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendInvite(invite.id)}
                            disabled={isResendingInvite === invite.id}
                            className="h-8"
                          >
                            <RefreshCw className="mr-1 h-4 w-4" />
                            {isResendingInvite === invite.id ? "Resending..." : "Resend"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeInvite(invite.id)}
                            disabled={isRevokingInvite === invite.id}
                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            {isRevokingInvite === invite.id ? "Revoking..." : "Revoke"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-medium">Team Members</h3>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.team.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Select
                        value={member.role}
                        onValueChange={(value) => handleChangeRole(member.id, value as "viewer" | "editor" | "admin")}
                        disabled={member.email === settings.profile.email} // Can't change own role
                      >
                        <SelectTrigger className="h-8 w-28">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{formatDate(member.joinedAt)}</TableCell>
                    <TableCell className="text-right">
                      {member.email !== settings.profile.email && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsRemovingMember(member.id)
                            setConfirmRemoveDialogOpen(true)
                          }}
                          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Confirm Remove Member Dialog */}
      <AlertDialog open={confirmRemoveDialogOpen} onOpenChange={setConfirmRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this team member? They will lose access to your account and all associated
              projects.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
