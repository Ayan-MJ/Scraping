"use client"

import { useState } from "react"
import { WizardHeader } from "../_components/wizard-header"
import { ReviewSummary } from "../_components/review-summary"
import { ConfirmationModal } from "../_components/confirmation-modal"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Rocket } from "lucide-react"

export default function ReviewPage() {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  // Sample data for the review page
  const reviewData = {
    template: {
      name: "E-commerce Product Listings",
      image: "/placeholder.svg?height=60&width=100",
      description: "Extract product details from major e-commerce sites",
    },
    urls: [
      { id: "1", url: "https://example.com/products", isValid: true },
      { id: "2", url: "https://example.com/products?page=1", isValid: true },
      { id: "3", url: "https://example.com/products?page=2", isValid: true },
    ],
    selectors: [
      {
        id: "1",
        name: "Product Title",
        selector: "h1.product-title",
        samples: ["iPhone 13 Pro", "Samsung Galaxy S22"],
      },
      { id: "2", name: "Price", selector: "span.price", samples: ["$999.99", "$899.99"] },
      {
        id: "3",
        name: "Description",
        selector: "div.product-description p",
        samples: ["The latest iPhone with...", "Experience the next generation..."],
      },
    ],
    schedule: {
      frequency: "daily",
      time: "09:00",
      timezone: "Asia/Kolkata",
      detectChanges: true,
      changeInterval: "30m",
    },
    advanced: {
      proxyPool: "Default (3 rotating IPs)",
      concurrency: "2 parallel requests",
      captcha: "Auto-solve enabled",
      userAgent: "Chrome 120 (Windows)",
      cookies: "Session cookies enabled",
    },
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <WizardHeader currentStep={5} totalSteps={5} />

      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Create New Scraper</h1>
          <p className="mt-1 text-muted-foreground">Step 5 of 5: Review & Launch</p>
        </div>

        <div className="space-y-4">
          <ReviewSummary
            title="Template"
            editLink="/projects/new/select-template"
            content={
              <div className="flex items-center gap-4">
                <div className="relative h-[60px] w-[100px] overflow-hidden rounded border bg-gray-100">
                  <img
                    src={reviewData.template.image || "/placeholder.svg"}
                    alt={reviewData.template.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{reviewData.template.name}</h3>
                  <p className="text-sm text-muted-foreground">{reviewData.template.description}</p>
                </div>
              </div>
            }
          />

          <ReviewSummary
            title="Target URLs"
            editLink="/projects/new/enter-urls"
            content={
              <div className="space-y-2">
                {reviewData.urls.map((url) => (
                  <div key={url.id} className="flex items-center justify-between rounded border bg-white p-2">
                    <span className="font-mono text-sm">{url.url}</span>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">{reviewData.urls.length} URLs configured</p>
              </div>
            }
          />

          <ReviewSummary
            title="Selectors"
            editLink="/projects/new/selector-builder"
            content={
              <div className="space-y-3">
                {reviewData.selectors.map((selector) => (
                  <div key={selector.id} className="rounded border bg-white p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{selector.name}</h4>
                      <span className="text-xs text-muted-foreground">{selector.samples.length} samples</span>
                    </div>
                    <code className="mt-1 block rounded bg-gray-100 px-2 py-1 text-xs">{selector.selector}</code>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="text-primary">
                    Preview Data
                  </Button>
                </div>
              </div>
            }
          />

          <ReviewSummary
            title="Schedule & Triggers"
            editLink="/projects/new/scheduling"
            content={
              <div className="space-y-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Frequency:</span>
                    <span>Daily at {reviewData.schedule.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Timezone:</span>
                    <span>{reviewData.schedule.timezone}</span>
                  </div>
                  {reviewData.schedule.detectChanges && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Change Detection:</span>
                      <span>Every {reviewData.schedule.changeInterval}</span>
                    </div>
                  )}
                </div>
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                  <p>First run will start immediately after launch</p>
                </div>
              </div>
            }
          />

          <ReviewSummary
            title="Advanced Options"
            editLink="/projects/new/advanced"
            content={
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Proxy Configuration</p>
                  <p className="text-sm text-muted-foreground">{reviewData.advanced.proxyPool}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Concurrency</p>
                  <p className="text-sm text-muted-foreground">{reviewData.advanced.concurrency}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">CAPTCHA Handling</p>
                  <p className="text-sm text-muted-foreground">{reviewData.advanced.captcha}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">User Agent</p>
                  <p className="text-sm text-muted-foreground">{reviewData.advanced.userAgent}</p>
                </div>
              </div>
            }
          />
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <Button variant="outline" onClick={() => {
            // Implement back functionality
          }}>Previous Step</Button>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsConfirmModalOpen(true)}>
            <Rocket className="h-4 w-4" /> Create and Launch Project
          </Button>
        </div>
      </main>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          // Handle scraper launch
          window.location.href = "/"
        }}
      />
    </div>
  )
}
