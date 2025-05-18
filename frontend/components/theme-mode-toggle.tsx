"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Monitor } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Needed to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  function toggleTheme() {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleTheme}
        className="flex items-center space-x-2"
      >
        <span className="flex items-center">
          {theme === 'light' && (
            <>
              <Sun className="h-4 w-4 mr-1" />
              <span className="text-xs">Light</span>
            </>
          )}
          {theme === 'dark' && (
            <>
              <Moon className="h-4 w-4 mr-1" />
              <span className="text-xs">Dark</span>
            </>
          )}
          {theme === 'system' && (
            <>
              <Monitor className="h-4 w-4 mr-1" />
              <span className="text-xs">System</span>
            </>
          )}
        </span>
      </Button>
    </div>
  )
} 