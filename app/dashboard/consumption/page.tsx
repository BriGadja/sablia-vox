import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ConsumptionSkeleton } from '@/components/skeletons'
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
    <Suspense fallback={<ConsumptionSkeleton />}>
      <ConsumptionClient />
    </Suspense>
  )
}
