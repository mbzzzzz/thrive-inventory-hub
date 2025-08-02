"use client"

import { useEffect, useRef } from "react"

export function MagnetLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    let lines: Line[] = []
    const numLines = 20
    const lineSpeed = 0.5
    const maxLineLength = 200
    const minLineLength = 50
    const lineWidth = 1
    const lineColor = "rgba(34, 197, 94, 0.3)" // Thrive Green with transparency

    class Line {
      x: number
      y: number
      length: number
      angle: number
      speed: number
      color: string

      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.length = Math.random() * (maxLineLength - minLineLength) + minLineLength
        this.angle = Math.random() * Math.PI * 2
        this.speed = lineSpeed * (0.5 + Math.random() * 0.5) // Vary speed slightly
        this.color = lineColor
      }

      update() {
        this.x += Math.cos(this.angle) * this.speed
        this.y += Math.sin(this.angle) * this.speed

        // Wrap around edges
        if (this.x > width + this.length) this.x = -this.length
        if (this.x < -this.length) this.x = width + this.length
        if (this.y > height + this.length) this.y = -this.length
        if (this.y < -this.length) this.y = height + this.length
      }

      draw() {
        ctx!.beginPath()
        ctx!.strokeStyle = this.color
        ctx!.lineWidth = lineWidth
        ctx!.moveTo(this.x, this.y)
        ctx!.lineTo(this.x + Math.cos(this.angle) * this.length, this.y + Math.sin(this.angle) * this.length)
        ctx!.stroke()
      }
    }

    const init = () => {
      canvas.width = width
      canvas.height = height
      lines = []
      for (let i = 0; i < numLines; i++) {
        lines.push(new Line())
      }
    }

    const animate = () => {
      ctx!.clearRect(0, 0, width, height)
      ctx!.fillStyle = "rgba(255, 255, 255, 0.05)" // Very subtle white overlay for trail effect
      ctx!.fillRect(0, 0, width, height)

      lines.forEach((line) => {
        line.update()
        line.draw()
      })

      animationFrameId.current = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      init()
    }

    window.addEventListener("resize", handleResize)

    init()
    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  return <canvas ref={canvasRef} className="magnet-lines pointer-events-none fixed inset-0 z-0 opacity-50" />
}
