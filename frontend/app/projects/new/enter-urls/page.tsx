"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { WizardHeader } from "../_components/wizard-header"
import { UrlInputForm } from "../_components/url-input-form"
import { WizardSidebar } from "../_components/wizard-sidebar"
import { WizardFooter } from "../_components/wizard-footer"
import { UrlList } from "../_components/url-list"
import { useToast } from "@/components/ui/use-toast"

interface UrlEntry {
  id: string
  url: string
  isValid: boolean
}

export default function EnterUrlsPage() {
  const [urls, setUrls] = useState<UrlEntry[]>([{ id: "1", url: "https://example.com/products", isValid: true }])

  const addUrl = (url: string) => {
    // Basic URL validation
    const isValid = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url)

    setUrls([...urls, { id: Date.now().toString(), url, isValid }])
  }

  const addBatchUrls = (batchText: string) => {
    const newUrls = batchText
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url !== "")
      .map((url) => {
        const isValid = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url)
        return { id: Date.now().toString() + Math.random().toString(36).substr(2, 9), url, isValid }
      })

    setUrls([...urls, ...newUrls])
  }

  const updateUrl = (id: string, newUrl: string) => {
    const isValid = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(newUrl)

    setUrls(urls.map((url) => (url.id === id ? { ...url, url: newUrl, isValid } : url)))
  }

  const deleteUrl = (id: string) => {
    setUrls(urls.filter((url) => url.id !== id))
  }

  const hasValidUrls = urls.some((url) => url.isValid)

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <WizardHeader currentStep={2} totalSteps={5} />

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex-1 p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Create New Scraper</h1>
            <p className="mt-1 text-muted-foreground">Step 2 of 5: Enter Target URLs</p>
          </div>

          <UrlInputForm onAddUrl={addUrl} onAddBatchUrls={addBatchUrls} />

          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold">URL List</h2>
            <UrlList urls={urls} onUpdateUrl={updateUrl} onDeleteUrl={deleteUrl} />
          </div>
        </div>

        <WizardSidebar
          title="Tips & Examples"
          content={
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Sample URL patterns:</p>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li className="font-mono">https://example.com/products</li>
                  <li className="font-mono">https://example.com/products?page=1</li>
                  <li className="font-mono">https://example.com/category/*/items</li>
                </ul>
              </div>
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                <p>You can use wildcards (*) for URL patterns to scrape multiple similar pages.</p>
              </div>
            </div>
          }
        />
      </div>

      <WizardFooter
        nextEnabled={hasValidUrls}
        nextStep="Configure Selectors"
        nextLink="/projects/new/selector-builder"
        backLink="/projects/new/select-template"
      />
    </div>
  )
}
