"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Pencil, Trash2, Plus } from "lucide-react"
import type { ProjectSettings } from "@/app/projects/[id]/settings/page"

interface ProxySettingsProps {
  settings: ProjectSettings
  onChange: (settings: Partial<ProjectSettings>) => void
}

export function ProxySettings({ settings, onChange }: ProxySettingsProps) {
  const [isAddProxyModalOpen, setIsAddProxyModalOpen] = useState(false)
  const [editingProxyId, setEditingProxyId] = useState<string | null>(null)
  const [proxyForm, setProxyForm] = useState({
    host: "",
    port: 8080,
    username: "",
    password: "",
  })

  const countries = [
    { value: "United States", label: "United States" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "Germany", label: "Germany" },
    { value: "France", label: "France" },
    { value: "Japan", label: "Japan" },
    { value: "Australia", label: "Australia" },
    { value: "Canada", label: "Canada" },
    { value: "Brazil", label: "Brazil" },
    { value: "India", label: "India" },
  ]

  const handleUseProxyPoolChange = (enabled: boolean) => {
    onChange({
      proxy: {
        ...settings.proxy,
        useProxyPool: enabled,
      },
    })
  }

  const handleSimulateLocationChange = (location: string) => {
    onChange({
      proxy: {
        ...settings.proxy,
        simulateLocation: location,
      },
    })
  }

  const handleAutoRotateLocationChange = (enabled: boolean) => {
    onChange({
      proxy: {
        ...settings.proxy,
        autoRotateLocation: enabled,
      },
    })
  }

  const openAddProxyModal = () => {
    setProxyForm({
      host: "",
      port: 8080,
      username: "",
      password: "",
    })
    setEditingProxyId(null)
    setIsAddProxyModalOpen(true)
  }

  const openEditProxyModal = (proxyId: string) => {
    const proxy = settings.proxy.proxies.find((p) => p.id === proxyId)
    if (proxy) {
      setProxyForm({
        host: proxy.host,
        port: proxy.port,
        username: proxy.username,
        password: proxy.password,
      })
      setEditingProxyId(proxyId)
      setIsAddProxyModalOpen(true)
    }
  }

  const handleDeleteProxy = (proxyId: string) => {
    const updatedProxies = settings.proxy.proxies.filter((p) => p.id !== proxyId)
    onChange({
      proxy: {
        ...settings.proxy,
        proxies: updatedProxies,
      },
    })
  }

  const handleSaveProxy = () => {
    if (editingProxyId) {
      // Edit existing proxy
      const updatedProxies = settings.proxy.proxies.map((p) => (p.id === editingProxyId ? { ...p, ...proxyForm } : p))
      onChange({
        proxy: {
          ...settings.proxy,
          proxies: updatedProxies,
        },
      })
    } else {
      // Add new proxy
      const newProxy = {
        id: `proxy-${Date.now()}`,
        ...proxyForm,
      }
      onChange({
        proxy: {
          ...settings.proxy,
          proxies: [...settings.proxy.proxies, newProxy],
        },
      })
    }
    setIsAddProxyModalOpen(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[#4F46E5] mb-4">Proxy & Geo Settings</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure proxies and geolocation settings for your scraper.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="use-proxy-pool" className="text-base">
                Use Proxy Pool
              </Label>
              <p className="text-sm text-muted-foreground">
                Route requests through a pool of proxies to avoid IP-based rate limiting.
              </p>
            </div>
            <Switch
              id="use-proxy-pool"
              checked={settings.proxy.useProxyPool}
              onCheckedChange={handleUseProxyPoolChange}
            />
          </div>

          {settings.proxy.useProxyPool && (
            <div className="ml-6 space-y-4 border-l-2 border-[#4F46E5]/20 pl-4 pt-2">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-medium">Proxy List</h3>
                <Button onClick={openAddProxyModal} className="bg-[#4F46E5] hover:bg-[#4338CA]" size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Proxy
                </Button>
              </div>

              {settings.proxy.proxies.length === 0 ? (
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
                        <TableHead>Host</TableHead>
                        <TableHead>Port</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settings.proxy.proxies.map((proxy) => (
                        <TableRow key={proxy.id}>
                          <TableCell className="font-medium">{proxy.host}</TableCell>
                          <TableCell>{proxy.port}</TableCell>
                          <TableCell>{proxy.username}</TableCell>
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
                                onClick={() => handleDeleteProxy(proxy.id)}
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
          )}
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="simulate-location">Simulate Location</Label>
            <Select value={settings.proxy.simulateLocation} onValueChange={handleSimulateLocationChange}>
              <SelectTrigger id="simulate-location">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Simulate requests coming from a specific geographic location.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-rotate"
              checked={settings.proxy.autoRotateLocation}
              onCheckedChange={(checked) => handleAutoRotateLocationChange(checked === true)}
            />
            <Label htmlFor="auto-rotate">Auto-rotate location each run</Label>
          </div>
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
    </div>
  )
}
