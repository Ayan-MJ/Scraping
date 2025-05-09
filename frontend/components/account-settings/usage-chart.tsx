"use client"

import { useEffect, useRef } from "react"

interface UsageChartProps {
  data: number[]
}

export function UsageChart({ data }: UsageChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // No data to display
    if (data.length === 0) return

    // Find min and max values
    const max = Math.max(...data) * 1.1 // Add 10% padding
    const min = 0 // Start from zero for usage charts

    // Calculate dimensions
    const padding = { top: 5, right: 5, bottom: 5, left: 5 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom

    // Calculate x and y positions
    const xStep = chartWidth / (data.length - 1)
    const getX = (i: number) => padding.left + i * xStep
    const getY = (value: number) => padding.top + chartHeight - ((value - min) / (max - min)) * chartHeight

    // Draw line
    ctx.beginPath()
    ctx.moveTo(getX(0), getY(data[0]))
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(getX(i), getY(data[i]))
    }
    ctx.strokeStyle = "#4F46E5"
    ctx.lineWidth = 2
    ctx.stroke()

    // Fill area under the line
    ctx.lineTo(getX(data.length - 1), getY(min))
    ctx.lineTo(getX(0), getY(min))
    ctx.closePath()
    ctx.fillStyle = "rgba(79, 70, 229, 0.1)"
    ctx.fill()

    // Draw dots for each data point
    for (let i = 0; i < data.length; i++) {
      ctx.beginPath()
      ctx.arc(getX(i), getY(data[i]), 3, 0, Math.PI * 2)
      ctx.fillStyle = "#4F46E5"
      ctx.fill()
    }
  }, [data])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
