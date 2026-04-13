import { Suspense } from 'react'
import { AgentsGridSkeleton } from '@/components/skeletons'
import { AgentsListClient } from './AgentsListClient'

export const metadata = {
  title: 'Agents | Sablia Vox Dashboard',
  description: 'Liste de tous vos agents vocaux IA d\u00E9ploy\u00E9s',
}

/**
 * Agents List Page - Server Component
 * Auth is handled by the dashboard layout
 */
export default function AgentsPage() {
  return (
    <Suspense fallback={<AgentsGridSkeleton />}>
      <AgentsListClient />
    </Suspense>
  )
}
