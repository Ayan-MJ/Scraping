"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { CodeEditor } from "@/components/project-settings/code-editor"
import type { ProjectSettings } from "@/app/projects/[id]/settings/page"

interface AntiBotSettingsProps {
  settings: ProjectSettings
  onChange: (settings: Partial<ProjectSettings>) => void
}

export function AntiBotSettings({ settings, onChange }: AntiBotSettingsProps) {
  const [isCodeEditorExpanded, setIsCodeEditorExpanded] = useState(false)

  const captchaProviders = [
    { value: "2captcha", label: "2Captcha" },
    { value: "anticaptcha", label: "Anti-Captcha" },
    { value: "capsolver", label: "CapSolver" },
    { value: "custom", label: "Custom Provider" },
  ]

  const handleCaptchaSolverChange = (enabled: boolean) => {
    onChange({
      captchaSolver: {
        ...settings.captchaSolver,
        enabled,
      },
    })
  }

  const handleCaptchaProviderChange = (provider: string) => {
    onChange({
      captchaSolver: {
        ...settings.captchaSolver,
        provider,
      },
    })
  }

  const handleCaptchaApiKeyChange = (apiKey: string) => {
    onChange({
      captchaSolver: {
        ...settings.captchaSolver,
        apiKey,
      },
    })
  }

  const handleBehaviorChange = (key: keyof ProjectSettings["behaviorSimulation"], value: boolean) => {
    onChange({
      behaviorSimulation: {
        ...settings.behaviorSimulation,
        [key]: value,
      },
    })
  }

  const handleCustomJavaScriptChange = (code: string) => {
    onChange({
      behaviorSimulation: {
        ...settings.behaviorSimulation,
        customJavaScript: code,
      },
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[#4F46E5] mb-4">Anti-Bot & CAPTCHA Settings</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure how your scraper handles CAPTCHAs and anti-bot measures.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="captcha-solver" className="text-base">
                Enable CAPTCHA Solver
              </Label>
              <p className="text-sm text-muted-foreground">Automatically solve CAPTCHAs encountered during scraping.</p>
            </div>
            <Switch
              id="captcha-solver"
              checked={settings.captchaSolver.enabled}
              onCheckedChange={handleCaptchaSolverChange}
            />
          </div>

          {settings.captchaSolver.enabled && (
            <div className="ml-6 space-y-4 border-l-2 border-[#4F46E5]/20 pl-4 pt-2">
              <div className="grid gap-2">
                <Label htmlFor="captcha-provider">CAPTCHA Provider</Label>
                <Select value={settings.captchaSolver.provider} onValueChange={handleCaptchaProviderChange}>
                  <SelectTrigger id="captcha-provider">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {captchaProviders.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="captcha-api-key">API Key</Label>
                <Input
                  id="captcha-api-key"
                  type="password"
                  value={settings.captchaSolver.apiKey}
                  onChange={(e) => handleCaptchaApiKeyChange(e.target.value)}
                  placeholder="Enter your CAPTCHA service API key"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-medium">Behavior Simulation</h3>
          <p className="text-sm text-muted-foreground">
            Simulate human-like behavior to avoid detection by anti-bot systems.
          </p>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="random-mouse"
                checked={settings.behaviorSimulation.randomMouseMovements}
                onCheckedChange={(checked) => handleBehaviorChange("randomMouseMovements", checked === true)}
              />
              <Label htmlFor="random-mouse">Random mouse movements</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="random-delays"
                checked={settings.behaviorSimulation.randomClickDelays}
                onCheckedChange={(checked) => handleBehaviorChange("randomClickDelays", checked === true)}
              />
              <Label htmlFor="random-delays">Random click delays</Label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="custom-js">Custom JavaScript</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCodeEditorExpanded(!isCodeEditorExpanded)}
                className="h-8 px-2"
              >
                {isCodeEditorExpanded ? (
                  <>
                    <ChevronUp className="mr-1 h-4 w-4" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 h-4 w-4" />
                    Expand
                  </>
                )}
              </Button>
            </div>
            <div className={`transition-all duration-150 ${isCodeEditorExpanded ? "h-80" : "h-32"}`}>
              <CodeEditor
                value={settings.behaviorSimulation.customJavaScript}
                onChange={handleCustomJavaScriptChange}
                language="javascript"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Custom JavaScript code to execute on each page. Use this to implement advanced behavior simulation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
