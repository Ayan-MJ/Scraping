import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function SelectorBuilderFooter() {
  return (
    <footer className="border-t bg-white py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Button variant="outline" className="gap-2" asChild>
          <Link href="/projects/new/enter-urls">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <Button className="gap-2 bg-[#4F46E5] hover:bg-[#4338CA]" asChild>
          <Link href="/projects/new/scheduling">
            Next: Scheduling
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </footer>
  )
}
