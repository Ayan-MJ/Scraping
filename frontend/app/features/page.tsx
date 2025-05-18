import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Code, Database, FileJson, Layers, Lock, Settings, Shuffle, Zap } from "lucide-react"
import { AnimatedGradient } from "@/components/ui/animated-gradient"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      {/* Header Section */}
      <section className="relative py-20 overflow-hidden">
        <AnimatedGradient />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-medium rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20">
            Product Features
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 animate-slide-up">
            Built for serious data collection
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Our platform provides the tools you need to scrape the web effectively, without detection, and with maximum flexibility.
          </p>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-16 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-brand-dark-light rounded-xl p-6 border border-gray-800 animate-fade-in">
              <div className="w-12 h-12 rounded-lg bg-brand-green/10 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold mb-3">Visual Selector Builder</h3>
              <p className="text-gray-400 mb-4">
                Point and click interface to build complex selectors without coding. Automatically finds the optimal CSS or XPath selectors.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">Interactive element picking</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">Selector optimization</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">Preview extraction results</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-brand-dark-light rounded-xl p-6 border border-gray-800 animate-fade-in delay-100">
              <div className="w-12 h-12 rounded-lg bg-brand-green/10 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold mb-3">Anti-Bot Protection Bypass</h3>
              <p className="text-gray-400 mb-4">
                Sophisticated scraping mechanisms that avoid detection and bypass common anti-bot protections.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">CAPTCHA handling</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">Browser fingerprint randomization</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">Request pattern naturalization</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-brand-dark-light rounded-xl p-6 border border-gray-800 animate-fade-in delay-200">
              <div className="w-12 h-12 rounded-lg bg-brand-green/10 flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold mb-3">Advanced Configuration</h3>
              <p className="text-gray-400 mb-4">
                Fine-tune every aspect of your scraping operation with detailed configuration options.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">Request throttling controls</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">Custom HTTP headers</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">JavaScript rendering options</span>
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="bg-brand-dark-light rounded-xl p-6 border border-gray-800 animate-fade-in delay-150">
              <div className="w-12 h-12 rounded-lg bg-brand-green/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold mb-3">Scheduled Scraping</h3>
              <p className="text-gray-400 mb-4">
                Set up recurring scraping jobs with flexible scheduling options to keep your data fresh.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">Cron-based scheduling</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">Time zone support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">Failure notification alerts</span>
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="bg-brand-dark-light rounded-xl p-6 border border-gray-800 animate-fade-in delay-250">
              <div className="w-12 h-12 rounded-lg bg-brand-green/10 flex items-center justify-center mb-4">
                <Shuffle className="h-6 w-6 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold mb-3">Proxy Management</h3>
              <p className="text-gray-400 mb-4">
                Automatically rotate IPs and manage proxy configurations to avoid rate limiting and blocks.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">Automatic IP rotation</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">Geo-location targeting</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">Proxy health monitoring</span>
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="bg-brand-dark-light rounded-xl p-6 border border-gray-800 animate-fade-in delay-300">
              <div className="w-12 h-12 rounded-lg bg-brand-green/10 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold mb-3">Data Processing</h3>
              <p className="text-gray-400 mb-4">
                Transform and clean your scraped data with powerful post-processing tools.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">Data transformation pipelines</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">Field type normalization</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-brand-green mr-2" />
                  <span className="text-sm text-gray-300">Duplicate detection and removal</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Export formats */}
      <section className="py-16 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Export Options</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start bg-brand-dark-light p-6 rounded-xl border border-gray-800 animate-fade-in">
              <div className="mr-4">
                <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center">
                  <FileJson className="h-5 w-5 text-brand-green" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">JSON</h3>
                <p className="text-gray-400 text-sm">
                  Export your data as JSON files for maximum compatibility with modern applications and APIs. Structured format perfect for web applications.
                </p>
              </div>
            </div>
            
            <div className="flex items-start bg-brand-dark-light p-6 rounded-xl border border-gray-800 animate-fade-in delay-100">
              <div className="mr-4">
                <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-brand-green" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">CSV</h3>
                <p className="text-gray-400 text-sm">
                  Export to CSV format for easy import into spreadsheet applications like Excel or Google Sheets. Perfect for data analysis and reporting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-[#0A2016] to-brand-dark opacity-70"></div>
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-slide-up">
            Ready to try these features?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
            Start scraping with confidence today. Sign up for a free account and see how our platform can revolutionize your data collection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
            <Button
              size="lg"
              className="bg-brand-green hover:bg-brand-green-dark text-white group transition-all duration-300"
              asChild
            >
              <Link href="/auth/signup">
                Get Started Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-gray-700 text-white hover:bg-gray-800" asChild>
              <Link href="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 