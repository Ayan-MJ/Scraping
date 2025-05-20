import { ReactNode } from "react"

interface SecurityFeatureProps {
  icon: ReactNode
  title: string
  description: string
  delay?: number
}

export function SecurityFeature({ icon, title, description, delay = 0 }: SecurityFeatureProps) {
  return (
    <div 
      className="flex items-start animate-slide-up" 
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mr-4 rounded-full bg-brand-green/10 p-2 text-brand-green">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-white mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  )
} 