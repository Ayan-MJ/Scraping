import { SelectorBuilderHeader } from "./_components/selector-builder-header"
import { SelectorBuilderCanvas } from "./_components/selector-builder-canvas"
import { SelectorBuilderFooter } from "./_components/selector-builder-footer"

export default function SelectorBuilderPage() {
  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB]">
      <SelectorBuilderHeader />
      <SelectorBuilderCanvas />
      <SelectorBuilderFooter />
    </div>
  )
}
