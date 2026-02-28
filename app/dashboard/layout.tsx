import { Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { DynamicBreadcrumb } from '@/components/dashboard/DynamicBreadcrumb'
import { AppSidebar } from '@/components/dashboard/Sidebar'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Dashboard | Sablia Vox',
  description: 'Tableau de bord analytique pour vos agents vocaux IA',
  robots: {
    index: false,
    follow: false,
  },
}

/**
 * Check if user has admin permissions
 */
async function checkIsAdminServer(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<boolean> {
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

/**
 * Dashboard Layout - Shared layout for all dashboard pages
 * Handles authentication and provides common dashboard structure with sidebar
 * Uses parallel routes for modal rendering (@modal slot)
 */
export default async function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  // Server-side authentication check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Check admin status
  const isAdmin = await checkIsAdminServer(supabase, user.id)

  return (
    <SidebarProvider>
      <AppSidebar userEmail={user.email || ''} isAdmin={isAdmin} />
      <SidebarInset className="bg-gradient-to-br from-black via-purple-950/20 to-black h-screen flex flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1 text-white/70 hover:text-white hover:bg-white/10" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-white/20" />
          <DynamicBreadcrumb />
        </header>
        <main className="flex-1 overflow-hidden min-h-0">
          <Suspense
            fallback={
              <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
        {/* Modal slot for intercepting routes */}
        {modal}
      </SidebarInset>
    </SidebarProvider>
  )
}
