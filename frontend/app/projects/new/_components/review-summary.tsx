"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewSummaryProps {
  title: string
  content: React.ReactNode
  editLink: string
  defaultOpen?: boolean
}

export function ReviewSummary({ title, content, editLink, defaultOpen = true }: ReviewSummaryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="rounded-lg border bg-[#F3F4F6] transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex cursor-pointer items-center justify-between p-4" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-3">
          <Link
            href={editLink}
            className={cn(
              "flex items-center gap-1 text-sm text-[#4F46E5] transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Link>
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="border-t bg-white p-4">{content}</div>
      </div>
    </div>
  )
}
