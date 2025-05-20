import { Button } from "@/components/ui/button"
import { PlusCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export function DashboardHero() {
  return (
    <section className="bg-background py-8 border-b">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your Scraping Projects</h1>
            <p className="text-muted-foreground mt-1">Overview of status, performance, and quick actions</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/docs">
              Read Documentation <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="primary" asChild>
            <Link href="/projects/new">
              Create New Project <PlusCircle className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
