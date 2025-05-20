"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
import { Pencil, Trash2, Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import type { AccountSettings } from "@/app/account/settings/page"

interface ProxyPoolSettingsProps {
  settings: AccountSettings
  onChange: (settings: Partial<AccountSettings>) => void
}

export function ProxyPoolSettings({ settings, onChange }: ProxyPoolSettingsProps) {
  const [isAddProxyModalOpen, setIsAddProxyModalOpen] = useState(false)
  const [editingProxyId, setEditingProxyId] = useState<string | null>(null)
  const [isDeletingProxyId, setIsDeletingProxyId] = useState<string | null>(null)
  const [proxyForm, setProxyForm] = useState({
    name: "",
    host: "",
    port: 8080,
    username: "",
    password: "",
    location: "United States",
  })
  const { toast } = useToast()

  const locations = [
    "United States",
    "United Kingdom",
    "Germany",
    "France",
    "Japan",
    "Australia",
    "Canada",
    "Brazil",
    "India",
  ]

  const openAddProxyModal = () => {
    setProxyForm({
      name: "",
      host: "",
      port: 8080,
      username: "",
      password: "",
      location: "United States",
    })
    setEditingProxyId(null)
    setIsAddProxyModalOpen(true)
  }

  const openEditProxyModal = (proxyId: string) => {
    const proxy = settings.proxyPool.proxies.find((p) => p.id === proxyId)
    if (proxy) {
      setProxyForm({
        name: proxy.name,
        host: proxy.host,
        port: proxy.port,
        username: proxy.username,
        password: proxy.password,
        location: proxy.location,
      })
      setEditingProxyId(proxyId)
      setIsAddProxyModalOpen(true)
    }
  }

  const handleSaveProxy = () => {
    if (!proxyForm.name || !proxyForm.host) {
      toast({
        title: "Missing information",
        description: "Please provide a name and host for the proxy.",
        variant: "destructive",
      })
      return
    }

    if (editingProxyId) {
      // Edit existing proxy
      const updatedProxies = settings.proxyPool.proxies.map((p) =>
        p.id === editingProxyId
          ? {
              ...p,
              ...proxyForm,
            }
          : p,
      )

      onChange({
        proxyPool: {
          ...settings.proxyPool,
          proxies: updatedProxies,
        },
      })

      toast({
        title: "Proxy updated",
        description: "The proxy has been updated successfully.",
      })
    } else {
      // Add new proxy
      if (settings.proxyPool.proxies.length >= settings.proxyPool.quota.limit) {
        toast({
          title: "Quota exceeded",
          description: "You have reached your proxy quota limit. Please upgrade your plan to add more proxies.",
          variant: "destructive",
        })
        setIsAddProxyModalOpen(false)
        return
      }

      const newProxy = {
        id: `proxy-${Date.now()}`,
        ...proxyForm,
        active: true,
      }

      onChange({
        proxyPool: {
          ...settings.proxyPool,
          proxies: [...settings.proxyPool.proxies, newProxy],
          quota: {
            ...settings.proxyPool.quota,
            total: settings.proxyPool.quota.total + 1,
            active: settings.proxyPool.quota.active + 1,
          },
        },
      })

      toast({
        title: "Proxy added",
        description: "The proxy has been added successfully.",
      })
    }

    setIsAddProxyModalOpen(false)
  }

  const handleToggleProxy = (proxyId: string, active: boolean) => {
    const updatedProxies = settings.proxyPool.proxies.map((p) => (p.id === proxyId ? { ...p, active } : p))
    const activeCount = updatedProxies.filter((p) => p.active).length

    onChange({
      proxyPool: {
        ...settings.proxyPool,
        proxies: updatedProxies,
        quota: {
          ...settings.proxyPool.quota,
          active: activeCount,
        },
      },
    })

    toast({
      title: active ? "Proxy activated" : "Proxy deactivated",
      description: `The proxy has been ${active ? "activated" : "deactivated"} successfully.`,
    })
  }

  const handleDeleteProxy = () => {
    if (!isDeletingProxyId) return

    const proxyToDelete = settings.proxyPool.proxies.find((p) => p.id === isDeletingProxyId)
    if (!proxyToDelete) return

    const updatedProxies = settings.proxyPool.proxies.filter((p) => p.id !== isDeletingProxyId)
    const activeCount = updatedProxies.filter((p) => p.active).length

    onChange({
      proxyPool: {
        ...settings.proxyPool,
        proxies: updatedProxies,
        quota: {
          ...settings.proxyPool.quota,
          total: settings.proxyPool.quota.total - 1,
          active: activeCount,
        },
      },
    })

    toast({
      title: "Proxy deleted",
      description: "The proxy has been deleted successfully.",
    })

    setIsDeletingProxyId(null)
  }

  const quotaPercentage = (settings.proxyPool.quota.total / settings.proxyPool.quota.limit) * 100
  const isNearQuotaLimit = quotaPercentage >= 80

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[#4F46E5] mb-4">Global Proxy Pool</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Manage your global proxy pool for use across all scraping projects.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium">Proxies</h3>
          <Button onClick={openAddProxyModal} className="bg-[#4F46E5] hover:bg-[#4338CA]">
            <Plus className="mr-2 h-4 w-4" />
            Add Proxy
          </Button>
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-muted/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-medium">Proxy Quota</h4>
                <p className="text-sm text-muted-foreground">
                  {settings.proxyPool.quota.total} of {settings.proxyPool.quota.limit} proxies used (
                  {settings.proxyPool.quota.active} active)
                </p>
              </div>
              <div className="w-full md:w-1/3">
                <Progress
                  value={quotaPercentage}
                  className={`h-2 ${isNearQuotaLimit ? "bg-amber-100" : "bg-muted"}`}
                  indicatorClassName={isNearQuotaLimit ? "bg-amber-500" : "bg-[#4F46E5]"}
                />
                {isNearQuotaLimit && (
                  <p className="text-xs text-amber-600 mt-1">
                    You're approaching your proxy limit. Consider upgrading your plan.
                  </p>
                )}
              </div>
            </div>
          </div>

          {settings.proxyPool.proxies.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-muted/20">
              <p className="text-muted-foreground">No proxies added yet</p>
              <Button variant="link" onClick={openAddProxyModal} className="text-[#4F46E5]">
                Add your first proxy
              </Button>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Host:Port</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.proxyPool.proxies.map((proxy) => (
                    <TableRow key={proxy.id}>
                      <TableCell className="font-medium">{proxy.name}</TableCell>
                      <TableCell>
                        {proxy.host}:{proxy.port}
                      </TableCell>
                      <TableCell>{proxy.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={proxy.active}
                            onCheckedChange={(checked) => handleToggleProxy(proxy.id, checked)}
                          />
                          <span className={proxy.active ? "text-green-600" : "text-muted-foreground"}>
                            {proxy.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditProxyModal(proxy.id)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsDeletingProxyId(proxy.id)}
                            className="h-8 w-8 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
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
      </div>

      {/* Add/Edit Proxy Modal */}
      <Dialog open={isAddProxyModalOpen} onOpenChange={setIsAddProxyModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingProxyId ? "Edit Proxy" : "Add Proxy"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="proxy-name">Name</Label>
              <Input
                id="proxy-name"
                value={proxyForm.name}
                onChange={(e) => setProxyForm({ ...proxyForm, name: e.target.value })}
                placeholder="e.g., US Proxy 1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="proxy-host">Host</Label>
                <Input
                  id="proxy-host"
                  value={proxyForm.host}
                  onChange={(e) => setProxyForm({ ...proxyForm, host: e.target.value })}
                  placeholder="proxy.example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="proxy-port">Port</Label>
                <Input
                  id="proxy-port"
                  type="number"
                  value={proxyForm.port}
                  onChange={(e) => setProxyForm({ ...proxyForm, port: Number(e.target.value) })}
                  placeholder="8080"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proxy-username">Username</Label>
              <Input
                id="proxy-username"
                value={proxyForm.username}
                onChange={(e) => setProxyForm({ ...proxyForm, username: e.target.value })}
                placeholder="username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proxy-password">Password</Label>
              <Input
                id="proxy-password"
                type="password"
                value={proxyForm.password}
                onChange={(e) => setProxyForm({ ...proxyForm, password: e.target.value })}
                placeholder="password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proxy-location">Location</Label>
              <Select
                value={proxyForm.location}
                onValueChange={(value) => setProxyForm({ ...proxyForm, location: value })}
              >
                <SelectTrigger id="proxy-location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProxyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProxy} className="bg-[#4F46E5] hover:bg-[#4338CA]">
              {editingProxyId ? "Update" : "Add"} Proxy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Proxy Confirmation Dialog */}
      <AlertDialog open={!!isDeletingProxyId} onOpenChange={(open) => !open && setIsDeletingProxyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Proxy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this proxy? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProxy} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
