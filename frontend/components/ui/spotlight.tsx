"use client"

import { useEffect, useRef, useState } from "react"

interface SpotlightProps {
  className?: string
  fill?: string
}

export function Spotlight({ className = "", fill = "white" }: SpotlightProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const updatePosition = (e: MouseEvent) => {
    if (!divRef.current) return

    const rect = divRef.current.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  useEffect(() => {
    const div = divRef.current
    if (!div) return

    setOpacity(1)

    window.addEventListener("mousemove", updatePosition)
    return () => {
      window.removeEventListener("mousemove", updatePosition)
    }
  }, [])

  return (
    <div
      ref={divRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <div
        className={`absolute bg-gradient-to-b from-${fill}/20 to-transparent rounded-full w-[40rem] h-[40rem] -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none transform-gpu`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          opacity: 0.8,
          transition: "opacity 0.3s ease"
        }}
      />
    </div>
  )
} 