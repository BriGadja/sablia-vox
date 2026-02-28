import { Loader2 } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ClientDetailClient } from './ClientDetailClient'

interface ClientDetailPageProps {
  params: Promise<{ clientId: string }>
}

export const metadata = {
  title: 'Detail Client | Sablia Vox Dashboard',
  description: 'Details et metriques du client',
}

/**
 * Client Detail Page - Server Component (Admin Only)
 * Displays detailed metrics and agents for a specific client
 */
export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { clientId } = await params
  const supabase = await createClient()

  // Server-side authentication check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify client exists
  const { data: client, error } = await supabase
    .from('clients')
    .select('id, name, industry')
    .eq('id', clientId)
    .single()

  if (error || !client) {
    notFound()
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <ClientDetailClient
        clientId={clientId}
        clientName={client.name}
        clientIndustry={client.industry}
      />
    </Suspense>
  )
}
