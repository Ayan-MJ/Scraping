"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"

interface AnimatedCounterProps {
  value: number
  suffix?: string
  duration?: number
}

export function AnimatedCounter({ value, suffix = "", duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    if (!inView) return

    countRef.current = 0
    const step = Math.ceil(value / (duration / 16))
    let lastTime = 0

    const updateCount = (time: number) => {
      if (!lastTime) lastTime = time
      const delta = time - lastTime
      
      if (delta >= 16) {
        countRef.current = Math.min(countRef.current + step, value)
        setCount(Math.floor(countRef.current))
        lastTime = time
      }

      if (countRef.current < value) {
        requestAnimationFrame(updateCount)
      }
    }

    requestAnimationFrame(updateCount)
  }, [inView, value, duration])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
} 