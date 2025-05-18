import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  size?: "default" | "sm" | "lg"
}

export function Spinner({ className, size = "default" }: SpinnerProps) {
  return (
    <Loader2
      className={cn(
        "animate-spin text-muted-foreground",
        {
          "h-4 w-4": size === "sm",
          "h-6 w-6": size === "default",
          "h-10 w-10": size === "lg",
        },
        className
      )}
    />
  )
} 