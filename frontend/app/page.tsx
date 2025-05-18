'use client';

import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Shield, Database, Zap, Code } from "lucide-react"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"
import { ClientLogos } from "@/components/landing/client-logos"
import { FeatureCard } from "@/components/landing/feature-card"
import { SecurityFeature } from "@/components/landing/security-feature"
import { Spotlight } from "@/components/ui/spotlight"
import { AnimatedGradient } from "@/components/ui/animated-gradient"
import { AnimatedCounter } from "@/components/ui/animated-counter"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-dark text-white overflow-hidden">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <Spotlight className="top-40 left-0" fill="white" />
        <AnimatedGradient />

        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block px-3 py-1 mb-6 text-xs font-medium rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 animate-fade-in">
              Grow on Your Terms
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 animate-slide-up">
              The modern web scraping platform
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 animate-slide-up delay-100">
              We're eliminating the friction and bias of traditional web scraping, connecting data engineers to quick,
              reliable results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
              <Button
                size="lg"
                className="bg-brand-green hover:bg-brand-green-dark text-white group transition-all duration-300"
                asChild
              >
                <a href="/auth/signup" className="group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-gray-700 text-white hover:bg-gray-800" asChild>
                <a href="/projects">View Dashboard</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-8 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 animate-slide-in-left delay-100">
              <CheckCircle className="h-5 w-5 text-brand-green" />
              <span>Advanced Selector Builder</span>
            </div>
            <div className="flex items-center gap-2 animate-slide-in-left delay-200">
              <CheckCircle className="h-5 w-5 text-brand-green" />
              <span>Anti-Bot Protection Bypass</span>
            </div>
            <div className="flex items-center gap-2 animate-slide-in-left delay-300">
              <CheckCircle className="h-5 w-5 text-brand-green" />
              <span>Fully Customizable Exports</span>
            </div>
          </div>
        </div>
      </section>

      {/* Client Logos */}
      <ClientLogos />

      {/* Stats Section */}
      <section className="py-16 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in delay-100">
              <div className="text-4xl font-bold text-brand-green mb-2">
                <AnimatedCounter value={10} suffix="M+" />
              </div>
              <p className="text-gray-400">Pages scraped daily</p>
            </div>
            <div className="animate-fade-in delay-200">
              <div className="text-4xl font-bold text-brand-green mb-2">
                <AnimatedCounter value={99} suffix="%" />
              </div>
              <p className="text-gray-400">Success rate</p>
            </div>
            <div className="animate-fade-in delay-300">
              <div className="text-4xl font-bold text-brand-green mb-2">
                <AnimatedCounter value={5000} suffix="+" />
              </div>
              <p className="text-gray-400">Happy customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-in-left">
              <div className="text-sm font-medium text-brand-green mb-2">The security first platform</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Simplify your data collection with our services</h2>
              <p className="text-gray-400 mb-8">
                Our platform focuses on secure, reliable data collection with advanced anti-detection techniques,
                ensuring your scraping projects run smoothly without interruptions.
              </p>

              <div className="space-y-4">
                <SecurityFeature
                  icon={<Shield className="h-5 w-5" />}
                  title="Anti-bot protection"
                  description="Bypass CAPTCHA and other anti-bot measures seamlessly"
                  delay={100}
                />
                <SecurityFeature
                  icon={<Database className="h-5 w-5" />}
                  title="Proxy management"
                  description="Rotate IPs and manage geo-locations automatically"
                  delay={200}
                />
                <SecurityFeature
                  icon={<Zap className="h-5 w-5" />}
                  title="Intelligent retries"
                  description="Auto-retry failed requests with smart backoff strategies"
                  delay={300}
                />
              </div>
            </div>

            <div className="relative animate-slide-in-right">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/20 to-transparent rounded-xl"></div>
              <div className="relative bg-brand-dark-light border border-brand-green/20 rounded-xl p-8 overflow-hidden group hover:border-brand-green/40 transition-all duration-500">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-brand-green/20 rounded-xl rotate-45 blur-sm group-hover:bg-brand-green/30 transition-all duration-500"></div>
                <div className="relative flex justify-center items-center h-64">
                  <Code className="h-16 w-16 text-brand-green animate-float" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Faster Smarter Section */}
      <section className="py-24 md:py-32 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 animate-slide-up">Faster. Smarter.</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-16 animate-slide-up delay-100">
            Use intelligent selectors, lower server detection, and facilitate more reliable data collection with our
            advanced scraping technology.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Visual Selector Builder"
              description="Point and click interface to build complex selectors without coding"
              icon={
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-green to-brand-green-dark flex items-center justify-center">
                  <Code className="h-6 w-6 text-white" />
                </div>
              }
              delay={100}
            />
            <FeatureCard
              title="Scheduled Scraping"
              description="Set up recurring scraping jobs with flexible scheduling options"
              icon={
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-green to-brand-green-dark flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              }
              delay={200}
            />
            <FeatureCard
              title="Advanced Data Processing"
              description="Transform and clean your data with powerful post-processing tools"
              icon={
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-green to-brand-green-dark flex items-center justify-center">
                  <Database className="h-6 w-6 text-white" />
                </div>
              }
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-[#0A2016] to-brand-dark opacity-70"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-green blur-[150px] opacity-20 animate-pulse-slow"></div>

        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 animate-slide-up">
            Ready to transform your data collection?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
            Start scraping with confidence today. Sign up for a free account and see how our platform can simplify your
            data collection workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
            <Button
              size="lg"
              className="bg-brand-green hover:bg-brand-green-dark text-white group transition-all duration-300"
              asChild
            >
              <a href="/auth/signup">
                Get Started for Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-gray-700 text-white hover:bg-gray-800" asChild>
              <a href="/docs">Read Documentation</a>
            </Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
