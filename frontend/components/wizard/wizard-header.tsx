interface WizardHeaderProps {
  currentStep: number
  totalSteps: number
}

export function WizardHeader({ currentStep, totalSteps }: WizardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-center px-4">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index + 1 === currentStep
                  ? "bg-[#4F46E5] scale-125"
                  : index + 1 < currentStep
                    ? "bg-[#4F46E5]/60"
                    : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </header>
  )
}
