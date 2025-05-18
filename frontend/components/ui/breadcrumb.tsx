"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbProps {
  homeRoute?: string
  customLabels?: Record<string, string>
  customComponents?: Record<string, React.ReactNode>
}

export function Breadcrumb({
  homeRoute = "/",
  customLabels = {},
  customComponents = {},
}: BreadcrumbProps) {
  const pathname = usePathname()
  
  // Skip rendering if we're on the home page
  if (pathname === "/" || pathname === homeRoute) {
    return null
  }

  // Split the pathname and filter out empty segments
  const segments = pathname.split("/").filter(Boolean)
  
  // If there are no segments, return null
  if (!segments.length) {
    return null
  }

  // Function to format segment name (convert kebab-case to Title Case)
  const formatSegmentName = (segment: string) => {
    // First check if we have a custom label
    if (customLabels[segment]) {
      return customLabels[segment]
    }
    
    // If it's a numeric or ID pattern, don't transform
    if (/^\d+$|^[0-9a-f]{8,}$/.test(segment)) {
      return segment
    }
    
    // Replace hyphens with spaces and capitalize each word
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  // Build breadcrumb items
  const items = segments.map((segment, index) => {
    // Build the href by joining all segments up to the current one
    const href = `/${segments.slice(0, index + 1).join("/")}`
    
    // Get the formatted name
    const name = formatSegmentName(segment)
    
    // Check if we have a custom component for this segment
    const customComponent = customComponents[segment]
    
    return {
      href,
      name,
      isLast: index === segments.length - 1,
      customComponent,
    }
  })

  return (
    <nav className="flex items-center text-sm">
      <Link
        href={homeRoute}
        className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
          
          {item.isLast ? (
            <span className="text-foreground font-medium">
              {item.customComponent || item.name}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.customComponent || item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
