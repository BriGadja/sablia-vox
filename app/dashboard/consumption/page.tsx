import { Suspense } from 'react'
import { ConsumptionSkeleton } from '@/components/skeletons'
import { checkIsAdminServer } from '@/lib/auth'
import { ConsumptionClient } from './ConsumptionClient'

export const metadata = {
  title: 'Consommation | Dashboard Sablia Vox',
  description: 'Suivi de la consommation par agent vocal',
}

export default async function ConsumptionPage() {
  const isAdmin = await checkIsAdminServer()

  return (
    <Suspense fallback={<ConsumptionSkeleton />}>
      <ConsumptionClient isAdmin={isAdmin} />
    </Suspense>
  )
}
