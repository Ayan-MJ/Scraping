"use client"

import Image from "next/image"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Template {
  id: string
  name: string
  description: string
  image: string
}

interface TemplateGridProps {
  templates: Template[]
  selectedTemplate: string | null
  onSelectTemplate: (templateId: string) => void
  onStartFromScratch: () => void
}

export function TemplateGrid({ templates, selectedTemplate, onSelectTemplate, onStartFromScratch }: TemplateGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Start from scratch card */}
      <div
        className={`group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 bg-white p-6 text-center transition-all duration-150 hover:shadow-md ${
          selectedTemplate === "scratch" ? "border-[#4F46E5]" : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={onStartFromScratch}
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 group-hover:bg-gray-200">
          <Plus className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold">Build from Scratch</h3>
        <p className="mt-2 text-sm text-muted-foreground">Create a custom scraper with your own selectors</p>
      </div>

      {/* Template cards */}
      {templates.map((template) => (
        <div
          key={template.id}
          className={`group cursor-pointer rounded-lg border-2 bg-white transition-all duration-150 hover:shadow-md ${
            selectedTemplate === template.id ? "border-[#4F46E5]" : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => onSelectTemplate(template.id)}
        >
          <div className="relative h-32 w-full overflow-hidden rounded-t-md bg-gray-100">
            <Image src={template.image || "/placeholder.svg"} alt={template.name} fill className="object-cover" />
          </div>
          <div className="p-4">
            <h3 className="font-semibold">{template.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                className={
                  selectedTemplate === template.id
                    ? "bg-[#4F46E5] hover:bg-[#4338CA]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              >
                Use Template
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
