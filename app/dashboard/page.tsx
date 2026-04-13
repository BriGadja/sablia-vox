import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Dashboard | Sablia Vox',
  description: 'Tableau de bord analytique pour vos agents vocaux IA',
}

/**
 * Dashboard Root Page - Server Component
 * Redirects to /dashboard/overview
 * Auth is handled by the dashboard layout
 */
export default function DashboardPage() {
  redirect('/dashboard/overview')
}
