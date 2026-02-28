import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminCallsClient } from './AdminCallsClient'

export const metadata: Metadata = {
  title: 'Admin - Historique des appels | Sablia Vox',
  description: 'Vue complète de tous les appels avec filtres avancés',
}

/**
 * Check if user is admin
 */
async function checkIsAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_client_permissions')
    .select('permission_level')
    .eq('user_id', userId)
    .eq('permission_level', 'admin')
    .limit(1)

  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }

  return data && data.length > 0
}

export default async function AdminCallsPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Check admin permission
  const isAdmin = await checkIsAdmin(user.id)

  if (!isAdmin) {
    // Redirect non-admins to main dashboard
    redirect('/dashboard')
  }

  return <AdminCallsClient />
}
