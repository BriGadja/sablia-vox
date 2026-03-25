'use client'
// 'use client' needed: scroll detection to show/hide the sticky bar

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      // Show after scrolling past the hero section (~100vh)
      setVisible(window.scrollY > window.innerHeight * 0.8)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <aside
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-lg transition-transform duration-300 md:hidden',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
      aria-label="Action rapide"
    >
      <Button
        asChild
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
      >
        <a href="#hero">Tester maintenant</a>
      </Button>
    </aside>
  )
}
