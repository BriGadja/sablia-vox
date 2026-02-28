'use client'

import { useEffect, useState } from 'react'

export function useCountAnimation(endValue: string, isInView: boolean, delay: number = 0) {
  const [displayValue, setDisplayValue] = useState('0')

  useEffect(() => {
    if (!isInView) return

    const timeout = setTimeout(() => {
      // Parse the value to determine the type of animation
      if (endValue.includes('%')) {
        // Percentage animation
        const target = parseInt(endValue)
        let current = 0
        const increment = target / 20
        const timer = setInterval(() => {
          current += increment
          if (current >= target) {
            setDisplayValue(`+${target}%`)
            clearInterval(timer)
          } else {
            setDisplayValue(`+${Math.floor(current)}%`)
          }
        }, 50)
        return () => clearInterval(timer)
      } else if (endValue === '24/7') {
        // Special case for 24/7
        setDisplayValue('24/7')
      } else if (endValue.includes('s')) {
        // Time animation (e.g., <2s)
        setDisplayValue(endValue)
      } else if (endValue === '100%') {
        // 100% animation
        let current = 0
        const timer = setInterval(() => {
          current += 5
          if (current >= 100) {
            setDisplayValue('100%')
            clearInterval(timer)
          } else {
            setDisplayValue(`${current}%`)
          }
        }, 30)
        return () => clearInterval(timer)
      }
    }, delay)

    return () => clearTimeout(timeout)
  }, [endValue, isInView, delay])

  return displayValue
}
