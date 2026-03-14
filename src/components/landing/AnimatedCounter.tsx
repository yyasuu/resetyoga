'use client'
import { useEffect, useRef, useState } from 'react'

export function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 2000,
  decimals = 0,
}: {
  target: number
  suffix?: string
  prefix?: string
  duration?: number
  decimals?: number
}) {
  const [value, setValue] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true)
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * target
      setValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.floor(current))
      if (progress >= 1) {
        clearInterval(timer)
        setValue(target)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [started, target, duration, decimals])

  return (
    <span ref={ref}>
      {prefix}
      {decimals > 0 ? value.toFixed(decimals) : value.toLocaleString()}
      {suffix}
    </span>
  )
}
