import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserConsumptionDashboardClient } from './UserConsumptionDashboardClient'

export const metadata = {
  title: 'Ma Consommation | Sablia Vox',
  description: "Suivi de votre consommation d'appels, SMS et emails",
}

export default async function ConsumptionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <UserConsumptionDashboardClient />
}
