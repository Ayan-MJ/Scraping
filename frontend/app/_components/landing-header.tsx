"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { ThemeSettings } from "@/components/theme-settings"
import { useAuth } from "@/components/auth/auth-provider"

export function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-brand-dark/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-white">
                Scrape<span className="text-brand-green">Wizard</span>
              </span>
            </Link>
            <nav className="ml-10 hidden md:flex space-x-8">
              <Link href="/features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-gray-300 hover:text-white transition-colors">
                Documentation
              </Link>
            </nav>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <ThemeSettings />
            {user ? (
              <Button className="bg-brand-green hover:bg-brand-green-dark text-white" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="text-gray-300 hover:text-white" asChild>
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button className="bg-brand-green hover:bg-brand-green-dark text-white" asChild>
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
          <div className="flex md:hidden items-center space-x-2">
            <ThemeSettings />
            <button className="text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-brand-dark animate-slide-down">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/features" className="text-gray-300 hover:text-white transition-colors py-2">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors py-2">
                Pricing
              </Link>
              <Link href="/docs" className="text-gray-300 hover:text-white transition-colors py-2">
                Documentation
              </Link>
            </nav>
            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-800">
              {user ? (
                <Button className="bg-brand-green hover:bg-brand-green-dark text-white w-full" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="text-gray-300 hover:text-white justify-start" asChild>
                    <Link href="/auth/login">Log in</Link>
                  </Button>
                  <Button className="bg-brand-green hover:bg-brand-green-dark text-white" asChild>
                    <Link href="/auth/signup">Sign up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
} 