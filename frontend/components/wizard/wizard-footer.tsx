import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WizardFooterProps {
  nextEnabled: boolean
  nextStep: string
  nextLink: string
  backDisabled?: boolean
  backLink?: string
}

export function WizardFooter({
  nextEnabled,
  nextStep,
  nextLink,
  backDisabled = false,
  backLink = "/",
}: WizardFooterProps) {
  return (
    <footer className="border-t bg-white py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Button variant="outline" className="gap-2" disabled={backDisabled} asChild={!backDisabled}>
          {!backDisabled ? (
            <Link href={backLink}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4" />
              Back
            </>
          )}
        </Button>

        <Button className="gap-2" disabled={!nextEnabled} asChild={nextEnabled}>
          {nextEnabled ? (
            <Link href={nextLink}>
              Next: {nextStep}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              Next: {nextStep}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </footer>
  )
}
