"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { WizardHeader } from "../_components/wizard-header"
import { TemplateGrid } from "../_components/template-grid"
import { WizardSidebar } from "../_components/wizard-sidebar"
import { WizardFooter } from "../_components/wizard-footer"
import { Input } from "@/components/ui/input"

export default function SelectTemplatePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const templates = [
    {
      id: "1",
      name: "Central Procurement Portal",
      description: "Scrape tenders from eprocure.gov.in",
      image: "/placeholder.svg?height=120&width=200",
    },
    {
      id: "2",
      name: "E-commerce Product Listings",
      description: "Extract product details from major e-commerce sites",
      image: "/placeholder.svg?height=120&width=200",
    },
    {
      id: "3",
      name: "News Articles",
      description: "Collect news articles from popular news websites",
      image: "/placeholder.svg?height=120&width=200",
    },
    {
      id: "4",
      name: "Real Estate Listings",
      description: "Gather property listings from real estate portals",
      image: "/placeholder.svg?height=120&width=200",
    },
    {
      id: "5",
      name: "Job Postings",
      description: "Extract job listings from career sites",
      image: "/placeholder.svg?height=120&width=200",
    },
    {
      id: "6",
      name: "Social Media Profiles",
      description: "Collect public profile data from social platforms",
      image: "/placeholder.svg?height=120&width=200",
    },
  ]

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleStartFromScratch = () => {
    setSelectedTemplate("scratch")
  }

  const selectedTemplateName =
    selectedTemplate === "scratch"
      ? "Custom Scraper"
      : templates.find((t) => t.id === selectedTemplate)?.name || "None selected"

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <WizardHeader currentStep={1} totalSteps={5} />

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex-1 p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Create New Scraper</h1>
            <p className="mt-1 text-muted-foreground">Step 1 of 5: Select a Template</p>
          </div>

          <TemplateGrid
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleSelectTemplate}
            onStartFromScratch={handleStartFromScratch}
          />
        </div>

        <WizardSidebar selectedTemplate={selectedTemplateName} />
      </div>

      <WizardFooter
        nextEnabled={selectedTemplate !== null}
        nextStep="Enter URLs"
        nextLink="/projects/new/enter-urls"
        backDisabled={true}
      />
    </div>
  )
}
