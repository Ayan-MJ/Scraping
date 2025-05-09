"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface UrlInputFormProps {
  onAddUrl: (url: string) => void
  onAddBatchUrls: (batchText: string) => void
}

export function UrlInputForm({ onAddUrl, onAddBatchUrls }: UrlInputFormProps) {
  const [singleUrl, setSingleUrl] = useState("")
  const [batchUrls, setBatchUrls] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isValidUrl, setIsValidUrl] = useState(true)

  const validateUrl = (url: string) => {
    const isValid = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url)
    setIsValidUrl(url === "" || isValid)
    return isValid
  }

  const handleAddUrl = () => {
    if (singleUrl.trim() && validateUrl(singleUrl)) {
      onAddUrl(singleUrl.trim())
      setSingleUrl("")
    }
  }

  const handleAddBatchUrls = () => {
    if (batchUrls.trim()) {
      onAddBatchUrls(batchUrls.trim())
      setBatchUrls("")
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddUrl()
    }
  }

  return (
    <div className="space-y-6">
      {/* Single URL Input */}
      <div className="space-y-2">
        <Label htmlFor="target-url">Target URL</Label>
        <div className="flex gap-2">
          <Input
            id="target-url"
            placeholder="https://example.com/page"
            value={singleUrl}
            onChange={(e) => {
              setSingleUrl(e.target.value)
              validateUrl(e.target.value)
            }}
            onKeyDown={handleKeyDown}
            className={`flex-1 ${
              !isValidUrl && singleUrl !== "" ? "border-2 border-red-500" : singleUrl ? "border-2 border-green-500" : ""
            }`}
          />
          <Button onClick={handleAddUrl} disabled={!singleUrl.trim()} className="bg-[#4F46E5] hover:bg-[#4338CA]">
            <Plus className="mr-2 h-4 w-4" />
            Add URL
          </Button>
        </div>
        {!isValidUrl && singleUrl !== "" && <p className="text-xs text-red-500 mt-1">Please enter a valid URL</p>}
      </div>

      {/* Batch URL Input */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between p-0 hover:bg-transparent">
              <span className="text-sm font-medium">Or paste multiple URLs</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-2 space-y-2">
          <Textarea
            placeholder="Enter one URL per line"
            value={batchUrls}
            onChange={(e) => setBatchUrls(e.target.value)}
            className="min-h-[120px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddBatchUrls}
              disabled={!batchUrls.trim()}
              className="bg-[#4F46E5] hover:bg-[#4338CA]"
            >
              Add URLs
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
