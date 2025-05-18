import Image from "next/image"

export function ClientLogos() {
  // Placeholder logos
  const logos = [
    { name: "Company 1", url: "/logos/logo1.svg" },
    { name: "Company 2", url: "/logos/logo2.svg" },
    { name: "Company 3", url: "/logos/logo3.svg" },
    { name: "Company 4", url: "/logos/logo4.svg" },
    { name: "Company 5", url: "/logos/logo5.svg" },
  ]

  return (
    <section className="border-t border-gray-800 py-16">
      <div className="container mx-auto px-4">
        <p className="text-center text-gray-400 mb-8 text-sm">TRUSTED BY INNOVATIVE COMPANIES</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {logos.map((logo, index) => (
            <div
              key={logo.name}
              className="h-8 opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
            >
              {/* Use a div with background for placeholder, in real implementation use Image component */}
              <div className="h-8 w-24 bg-gray-500 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 