import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Clients Layout - Admin Only
 * This layout protects all routes under /dashboard/clients
 * Only users with admin permission can access this section
 */
export default async function ClientsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // Check if user has admin permission
  const { data: permissions } = await supabase
    .from('user_client_permissions')
    .select('permission_level')
    .eq('permission_level', 'admin')
    .limit(1)

  // If no admin permission, return 404
  if (!permissions || permissions.length === 0) {
    notFound()
  }

  return <>{children}</>
}
