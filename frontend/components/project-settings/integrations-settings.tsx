"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Copy, RefreshCw } from "lucide-react"
import type { ProjectSettings } from "@/app/projects/[id]/settings/page"

interface IntegrationsSettingsProps {
  settings: ProjectSettings
  onChange: (settings: Partial<ProjectSettings>) => void
}

export function IntegrationsSettings({ settings, onChange }: IntegrationsSettingsProps) {
  const [isTestingWebhook, setIsTestingWebhook] = useState(false)
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false)
  const { toast } = useToast()

  const handleExportFormatChange = (
    format: keyof ProjectSettings["integrations"]["exportFormats"],
    checked: boolean,
  ) => {
    onChange({
      integrations: {
        ...settings.integrations,
        exportFormats: {
          ...settings.integrations.exportFormats,
          [format]: checked,
        },
      },
    })
  }

  const handleWebhookEnabledChange = (enabled: boolean) => {
    onChange({
      integrations: {
        ...settings.integrations,
        webhook: {
          ...settings.integrations.webhook,
          enabled,
        },
      },
    })
  }

  const handleWebhookUrlChange = (url: string) => {
    onChange({
      integrations: {
        ...settings.integrations,
        webhook: {
          ...settings.integrations.webhook,
          url,
        },
      },
    })
  }

  const handleTestWebhook = async () => {
    if (!settings.integrations.webhook.url) return

    setIsTestingWebhook(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Webhook test successful",
      description: "A test payload was sent to your webhook URL.",
    })

    setIsTestingWebhook(false)
  }

  const handleRegenerateApiKey = async () => {
    setIsRegeneratingKey(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newApiKey = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

    onChange({
      integrations: {
        ...settings.integrations,
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
    navigator.clipboard.writeText(settings.integrations.apiKey)
    toast({
      title: "API key copied",
      description: "The API key has been copied to your clipboard.",
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[#4F46E5] mb-4">Integrations & Exports</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure export formats and integrations with external services.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-base font-medium">Export Formats</h3>
          <p className="text-sm text-muted-foreground">
            Select the formats in which your scraped data can be exported.
          </p>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="export-csv"
                checked={settings.integrations.exportFormats.csv}
                onCheckedChange={(checked) => handleExportFormatChange("csv", checked === true)}
              />
              <Label htmlFor="export-csv">CSV</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="export-json"
                checked={settings.integrations.exportFormats.json}
                onCheckedChange={(checked) => handleExportFormatChange("json", checked === true)}
              />
              <Label htmlFor="export-json">JSON</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="export-excel"
                checked={settings.integrations.exportFormats.excel}
                onCheckedChange={(checked) => handleExportFormatChange("excel", checked === true)}
              />
              <Label htmlFor="export-excel">Excel</Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-webhook" className="text-base">
                Enable Webhook
              </Label>
              <p className="text-sm text-muted-foreground">Send scraped data to an external service via webhook.</p>
            </div>
            <Switch
              id="enable-webhook"
              checked={settings.integrations.webhook.enabled}
              onCheckedChange={handleWebhookEnabledChange}
            />
          </div>

          {settings.integrations.webhook.enabled && (
            <div className="ml-6 space-y-4 border-l-2 border-[#4F46E5]/20 pl-4 pt-2">
              <div className="grid gap-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    value={settings.integrations.webhook.url}
                    onChange={(e) => handleWebhookUrlChange(e.target.value)}
                    placeholder="https://example.com/webhook"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleTestWebhook}
                    disabled={!settings.integrations.webhook.url || isTestingWebhook}
                    variant="outline"
                  >
                    {isTestingWebhook ? "Testing..." : "Test"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll send a POST request with the scraped data to this URL.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-medium">API Access</h3>
          <p className="text-sm text-muted-foreground">
            Use this API key to access your scraped data programmatically.
          </p>

          <div className="rounded-md border bg-muted/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="api-key" className="text-sm font-medium">
                API Key
              </Label>
              <div className="flex gap-2">
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
            <div className="bg-muted p-2 rounded-md font-mono text-xs overflow-x-auto">
              {settings.integrations.apiKey}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Keep this key secret. Regenerating will invalidate the old key.
            </p>
          </div>

          <div className="rounded-md border bg-muted/20 p-4">
            <Label className="text-sm font-medium mb-2 block">Example API Usage</Label>
            <div className="bg-muted p-2 rounded-md font-mono text-xs overflow-x-auto">
              {`curl -X GET "https://api.scrapewizard.com/v1/projects/${settings.id}/data" \\
  -H "Authorization: Bearer ${settings.integrations.apiKey}" \\
  -H "Content-Type: application/json"`}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
