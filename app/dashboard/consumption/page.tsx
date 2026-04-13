import { Suspense } from 'react'
import { ConsumptionSkeleton } from '@/components/skeletons'
import { ConsumptionClient } from './ConsumptionClient'

export const metadata = {
  title: 'Consommation | Dashboard Sablia Vox',
  description: 'Suivi de la consommation par agent vocal',
}

/**
 * Consumption Page - Server Component
 * Auth is handled by the dashboard layout
 */
export default function ConsumptionPage() {
  return (
    <Suspense fallback={<ConsumptionSkeleton />}>
      <ConsumptionClient />
    </Suspense>
  )
}
