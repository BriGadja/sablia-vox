'use client'

import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  children: React.ReactNode
  className?: string
}

/**
 * Modal Component for Dashboard
 * Used with intercepting routes to display content in a modal overlay
 * Handles keyboard navigation (Escape to close) and click outside to close
 */
export function Modal({ children, className }: ModalProps) {
  const router = useRouter()
  const overlayRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const onDismiss = useCallback(() => {
    router.back()
  }, [router])

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss()
      }
    },
    [onDismiss],
  )

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onKeyDown])

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current || e.target === wrapperRef.current) {
        onDismiss()
      }
    },
    [onDismiss],
  )

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      onClick={onClick}
    >
      <div
        ref={wrapperRef}
        className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-16 flex items-start justify-center overflow-y-auto"
        onClick={onClick}
      >
        <div
          className={cn(
            'relative w-full max-w-5xl bg-linear-to-br from-gray-900 via-gray-900 to-purple-950/30 rounded-2xl border border-white/10 shadow-2xl my-4',
            className,
          )}
        >
          {/* Close Button */}
          <button
            onClick={onDismiss}
            className="absolute right-4 top-4 z-10 p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Content */}
          <div className="overflow-hidden rounded-2xl">{children}</div>
        </div>
      </div>
    </div>
  )
}
