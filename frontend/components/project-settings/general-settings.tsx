"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProjectSettings } from "@/app/projects/[id]/settings/page"

interface GeneralSettingsProps {
  settings: ProjectSettings
  onChange: (settings: Partial<ProjectSettings>) => void
}

export function GeneralSettings({ settings, onChange }: GeneralSettingsProps) {
  const cloudRegions = [
    { value: "us-east-1", label: "US East (N. Virginia)" },
    { value: "us-west-1", label: "US West (N. California)" },
    { value: "eu-west-1", label: "EU (Ireland)" },
    { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
    { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[#4F46E5] mb-4">General Settings</h2>
        <p className="text-sm text-muted-foreground mb-6">Configure the basic settings for your scraping project.</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="project-name">Project Name</Label>
          <Input
            id="project-name"
            value={settings.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Enter project name"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="project-description">Description</Label>
          <Textarea
            id="project-description"
            value={settings.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Describe what this scraper does"
            rows={4}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="concurrency">Concurrency ({settings.concurrency})</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="concurrency"
              min={1}
              max={50}
              step={1}
              value={[settings.concurrency]}
              onValueChange={(value) => onChange({ concurrency: value[0] })}
              className="flex-1"
            />
            <span className="w-12 text-center font-medium">{settings.concurrency}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Number of parallel requests to make. Higher values may increase speed but also increase the chance of being
            detected.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cloud-region">Cloud Region</Label>
          <Select value={settings.cloudRegion} onValueChange={(value) => onChange({ cloudRegion: value })}>
            <SelectTrigger id="cloud-region">
              <SelectValue placeholder="Select a region" />
            </SelectTrigger>
            <SelectContent>
              {cloudRegions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            The region where your scraper will run. Choose a region close to the target website for better performance.
          </p>
        </div>
      </div>
    </div>
  )
}
