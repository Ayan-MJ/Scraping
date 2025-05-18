"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Settings, Sun, Moon, Monitor } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { EnhancedThemeToggle } from "@/components/enhanced-theme-toggle"
import { ThemeModeToggle } from "@/components/theme-mode-toggle"

export function ThemeSettings() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Theme settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Theme Settings</DialogTitle>
          <DialogDescription>
            Customize the appearance of the application.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Toggle options</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm">Simple toggle</span>
              <ThemeModeToggle />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Dropdown toggle</span>
              <EnhancedThemeToggle />
            </div>
          </div>
          
          <RadioGroup 
            value={theme} 
            onValueChange={setTheme}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem 
                value="light" 
                id="theme-light" 
                className="sr-only peer" 
              />
              <Label
                htmlFor="theme-light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Sun className="mb-3 h-6 w-6" />
                <span className="text-xs font-medium">Light</span>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem 
                value="dark" 
                id="theme-dark" 
                className="sr-only peer" 
              />
              <Label
                htmlFor="theme-dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Moon className="mb-3 h-6 w-6" />
                <span className="text-xs font-medium">Dark</span>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem 
                value="system" 
                id="theme-system" 
                className="sr-only peer" 
              />
              <Label
                htmlFor="theme-system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Monitor className="mb-3 h-6 w-6" />
                <span className="text-xs font-medium">System</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 