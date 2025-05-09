"use client"

import { useState } from "react"
import { WizardHeader } from "@/components/wizard/wizard-header"
import { ReviewSummary } from "@/components/wizard/review-summary"
import { ConfirmationModal } from "@/components/wizard/confirmation-modal"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <WizardHeader currentStep={5} totalSteps={5} />

      <div className="flex-1 p-4 pb-24 md:p-8 md:pb-24">
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
                  <Button variant="outline" size="sm" className="text-[#4F46E5]">
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
                <div className="rounded bg-blue-50 p-2 text-sm text-blue-800">
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
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/projects/new/scheduling">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button className="gap-2 bg-[#4F46E5] hover:bg-[#4338CA]" onClick={() => setIsConfirmModalOpen(true)}>
            Launch Scraper
          </Button>
        </div>
      </div>

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
