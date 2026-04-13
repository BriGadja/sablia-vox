import { Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ConsumptionClient } from './ConsumptionClient'

export const metadata = {
  title: 'Consommation | Dashboard Sablia Vox',
  description: 'Suivi de la consommation par agent vocal',
}

export default async function ConsumptionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <ConsumptionClient />
    </Suspense>
  )
}
