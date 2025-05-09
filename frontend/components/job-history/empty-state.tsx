import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 relative w-48 h-48">
        <Image
          src="/placeholder.svg?height=192&width=192"
          alt="No runs found illustration"
          width={192}
          height={192}
          className="object-contain"
        />
      </div>
      <h3 className="text-xl font-semibold mb-2">No runs yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">Run a job to see your scraping history and logs here.</p>
      <Button className="bg-[#4F46E5] hover:bg-[#4338CA]" asChild>
        <Link href="/projects/new/select-template">
          Create a new scraper
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}
