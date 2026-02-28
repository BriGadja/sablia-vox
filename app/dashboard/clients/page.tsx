import { Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ClientsListClient } from './ClientsListClient'

export const metadata = {
  title: 'Clients | Sablia Vox Dashboard',
  description: 'Gestion des clients et de leurs agents',
}

/**
 * Clients List Page - Server Component (Admin Only)
 * Displays all clients with their metrics and agents
 */
export default async function ClientsPage() {
  const supabase = await createClient()

  // Server-side authentication check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <ClientsListClient />
    </Suspense>
  )
}
