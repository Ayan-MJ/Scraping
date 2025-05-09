import { InfoIcon } from "lucide-react"
import type { ReactNode } from "react"

interface WizardSidebarProps {
  selectedTemplate?: string
  title?: string
  content?: ReactNode
}

export function WizardSidebar({ selectedTemplate, title, content }: WizardSidebarProps) {
  return (
    <aside className="w-full border-t bg-white p-6 lg:w-80 lg:border-l lg:border-t-0">
      {title ? <h3 className="font-semibold">{title}</h3> : <h3 className="font-semibold">Wizard Summary</h3>}

      <div className="mt-4 space-y-4">
        {selectedTemplate && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Selected Template:</p>
            <p className="mt-1 font-medium">{selectedTemplate}</p>
          </div>
        )}

        {content ? (
          content
        ) : (
          <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
            <InfoIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>You can edit selectors in the next step.</p>
          </div>
        )}
      </div>
    </aside>
  )
}
