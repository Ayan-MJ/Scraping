import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { AnimatedGradient } from "@/components/ui/animated-gradient"

interface PricingTier {
  name: string
  price: string
  description: string
  features: string[]
  buttonText: string
  buttonLink: string
  highlighted?: boolean
}

export default function PricingPage() {
  const pricingTiers: PricingTier[] = [
    {
      name: "Free",
      price: "$0",
      description: "For individual developers trying out web scraping.",
      features: [
        "5 scraping projects",
        "100 pages per month",
        "Basic selector builder",
        "JSON/CSV exports",
        "Community support"
      ],
      buttonText: "Get Started",
      buttonLink: "/auth/signup"
    },
    {
      name: "Pro",
      price: "$49",
      description: "For professional developers with regular scraping needs.",
      features: [
        "Unlimited projects",
        "10,000 pages per month",
        "Advanced selector builder",
        "Anti-bot protection bypass",
        "Scheduled scraping",
        "Data transformation tools",
        "Email & chat support"
      ],
      buttonText: "Subscribe Now",
      buttonLink: "/auth/signup?plan=pro",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For organizations with high-volume scraping requirements.",
      features: [
        "All Pro features",
        "Dedicated infrastructure",
        "Custom proxy pool",
        "Advanced IP rotation",
        "Custom data processing",
        "SLA guarantees",
        "Dedicated support manager"
      ],
      buttonText: "Contact Sales",
      buttonLink: "/contact-sales"
    }
  ]

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      {/* Header Section */}
      <section className="relative py-20 overflow-hidden">
        <AnimatedGradient />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-medium rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20">
            Pricing
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 animate-slide-up">
            Choose your scraping plan
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Affordable plans for developers and businesses of all sizes. Pay only for what you need.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`bg-brand-dark-light rounded-xl border ${
                  tier.highlighted
                    ? "border-brand-green/50 shadow-lg shadow-brand-green/10"
                    : "border-gray-800"
                } p-6 flex flex-col animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-0 right-0 text-center">
                    <span className="bg-brand-green text-white text-xs px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    {tier.price !== "Custom" && <span className="text-gray-400 ml-1">/month</span>}
                  </div>
                  <p className="text-gray-400 text-sm">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {tier.features.map(feature => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-brand-green mr-2 flex-shrink-0" />
                      <span className="text-gray-200 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className={
                    tier.highlighted
                      ? "bg-brand-green hover:bg-brand-green-dark text-white mt-auto"
                      : "bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800/50 text-white mt-auto"
                  }
                  asChild
                >
                  <Link href={tier.buttonLink}>{tier.buttonText}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-brand-dark-light rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold mb-2">Do you offer a free trial?</h3>
              <p className="text-gray-400">
                Yes! Our Free plan is essentially a free trial with a limited number of pages. You can upgrade anytime when you need more capacity.
              </p>
            </div>
            
            <div className="bg-brand-dark-light rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold mb-2">What happens if I exceed my monthly page limit?</h3>
              <p className="text-gray-400">
                If you reach your monthly page limit, you can either upgrade your plan or wait until the next billing cycle for your quota to reset.
              </p>
            </div>
            
            <div className="bg-brand-dark-light rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-400">
                Yes, you can cancel your subscription at any time. Your plan will remain active until the end of your current billing cycle.
              </p>
            </div>
            
            <div className="bg-brand-dark-light rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold mb-2">Do you offer custom plans?</h3>
              <p className="text-gray-400">
                Yes, we offer custom plans for enterprise customers with specific requirements. Contact our sales team to discuss your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start scraping?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Try our platform free today. No credit card required.
          </p>
          <Button
            size="lg"
            className="bg-brand-green hover:bg-brand-green-dark text-white"
            asChild
          >
            <Link href="/auth/signup">Create Free Account</Link>
          </Button>
        </div>
      </section>
    </div>
  )
} 