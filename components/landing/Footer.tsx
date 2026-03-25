import { Separator } from '@/components/ui/separator'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Logo */}
          <a
            href="#hero"
            className="font-[family-name:var(--font-display)] text-lg font-bold text-foreground transition-colors hover:text-primary"
          >
            Sablia <span className="text-primary">Vox</span>
          </a>

          {/* Legal links */}
          <nav
            className="flex items-center gap-4 text-sm text-muted-foreground"
            aria-label="Liens légaux"
          >
            <a href="/mentions-legales" className="transition-colors hover:text-foreground">
              Mentions légales
            </a>
            <Separator orientation="vertical" className="h-4" />
            <a href="/confidentialite" className="transition-colors hover:text-foreground">
              Confidentialité
            </a>
          </nav>

          {/* Social placeholder */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/company/sablia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
              aria-label="LinkedIn"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <Separator className="my-6" />

        <p className="text-center text-xs text-muted-foreground">
          &copy; {currentYear} Sablia. Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}
