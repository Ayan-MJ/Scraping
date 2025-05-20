import { Button } from "@/components/ui/button"
import { WizardHeader } from "../_components/wizard-header"
import { WizardFooter } from "../_components/wizard-footer"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function AdvancedOptionsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <WizardHeader currentStep={5} totalSteps={5} />

      <div className="flex-1 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Create New Scraper</h1>
          <p className="mt-1 text-muted-foreground">Advanced Options</p>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-xl font-semibold mb-4">Advanced Configuration</h2>
          <p className="text-muted-foreground">
            This is a placeholder for the advanced options page. In a complete implementation, this would include proxy
            settings, concurrency options, CAPTCHA handling, and more.
          </p>
        </div>
      </div>

      <WizardFooter
        nextEnabled={true}
        nextStep="Continue"
        nextLink="/projects/new/review"
        backLink="/projects/new/scheduling"
      />
    </div>
  )
}
