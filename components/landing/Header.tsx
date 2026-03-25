'use client'

// 'use client' needed: scroll detection, mobile menu state, IntersectionObserver

import { Menu, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '#benefices', label: 'Bénéfices' },
  { href: '#comment-ca-marche', label: 'Comment ça marche' },
  { href: '#cas-usage', label: "Cas d'usage" },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
] as const

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sectionIds = NAV_LINKS.map((l) => l.href.slice(1))
    const observers: IntersectionObserver[] = []

    for (const id of sectionIds) {
      const el = document.getElementById(id)
      if (!el) continue

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setActiveSection(id)
          }
        },
        { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
      )
      observer.observe(el)
      observers.push(observer)
    }

    return () => {
      for (const obs of observers) obs.disconnect()
    }
  }, [])

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    setMobileOpen(false)
    const href = e.currentTarget.getAttribute('href')
    if (!href?.startsWith('#')) return

    e.preventDefault()
    const el = document.getElementById(href.slice(1))
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-lg shadow-black/10'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo — biome-ignore: anchor with hash href is valid section navigation */}
        {/* biome-ignore lint/a11y/useValidAnchor: hash anchor for smooth scroll navigation */}
        <a
          href="#hero"
          onClick={handleNavClick}
          className="font-[family-name:var(--font-display)] text-xl font-bold text-foreground transition-colors hover:text-primary"
        >
          Sablia <span className="text-primary">Vox</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleNavClick}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                activeSection === link.href.slice(1) ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Button
            asChild
            className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
          >
            {/* biome-ignore lint/a11y/useValidAnchor: hash anchor for smooth scroll navigation */}
            <a href="#hero" onClick={handleNavClick}>
              Tester maintenant
            </a>
          </Button>
        </div>

        {/* Mobile burger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          className="border-t border-border bg-background/95 backdrop-blur-lg md:hidden"
          aria-label="Navigation mobile"
        >
          <div className="space-y-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className={cn(
                  'block rounded-md px-3 py-2 text-base font-medium transition-colors',
                  activeSection === link.href.slice(1)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-card hover:text-foreground',
                )}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <Button
                asChild
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {/* biome-ignore lint/a11y/useValidAnchor: hash anchor for smooth scroll navigation */}
                <a href="#hero" onClick={handleNavClick}>
                  Tester maintenant
                </a>
              </Button>
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
