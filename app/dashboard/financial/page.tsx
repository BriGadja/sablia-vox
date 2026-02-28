import type { Metadata } from 'next'
import { FinancialDashboardClient } from './FinancialDashboardClient'

export const metadata: Metadata = {
  title: 'Dashboard Financier | Sablia Vox',
  description: 'Suivi financier en temps réel : marge, coûts, revenue par client',
}

export default function FinancialDashboardPage() {
  return <FinancialDashboardClient />
}
