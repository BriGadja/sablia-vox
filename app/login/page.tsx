import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Connexion | Dashboard Sablia Vox',
  description: 'Connectez-vous au dashboard analytics Sablia Vox',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-linear-to-br from-purple-900/20 via-black to-blue-900/20">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      {/* Login Form — Suspense required for useSearchParams() in LoginForm */}
      <div className="relative z-10">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
