import { Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { DynamicBreadcrumb } from '@/components/dashboard/DynamicBreadcrumb'
import { WelcomeModal } from '@/components/dashboard/WelcomeModal'
import { AppSidebar } from '@/components/dashboard/Sidebar'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { checkIsAdminServer } from '@/lib/auth'
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
  const isAdmin = await checkIsAdminServer()

  return (
    <SidebarProvider>
      <AppSidebar userEmail={user.email || ''} isAdmin={isAdmin} />
      <SidebarInset className="bg-linear-to-br from-black via-purple-950/20 to-black">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1 text-white/70 hover:text-white hover:bg-white/10" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-white/20" />
          <DynamicBreadcrumb />
        </header>
        <div className="flex-1 overflow-hidden min-h-0 min-w-0">
          <Suspense
            fallback={
              <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
        {/* Modal slot for intercepting routes */}
        {modal}
        {/* Welcome modal for first-time users */}
        {!user.user_metadata?.onboarded_at && (
          <WelcomeModal showWelcome />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
