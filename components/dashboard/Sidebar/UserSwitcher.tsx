'use client'

import { Check, ChevronsUpDown, Globe, Shield, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { useViewAsUser } from '@/lib/hooks/useViewAsUser'
import { cn } from '@/lib/utils'

interface UserSwitcherProps {
  isAdmin: boolean
}

/**
 * UserSwitcher Component
 * Allows admins to switch between global view and user-specific views
 * Selected user is stored in URL search params (?viewAsUser=userId)
 * Persists across navigation
 */
export function UserSwitcher({ isAdmin }: UserSwitcherProps) {
  const { viewAsUserId, selectedUser, isViewingAsUser, users, isLoadingUsers, setViewAsUser } =
    useViewAsUser(isAdmin)

  // If not admin, show simple branding
  if (!isAdmin) {
    return (
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-default"
      >
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
          V
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold text-white">Sablia Vox</span>
          <span className="truncate text-xs text-white/60">Dashboard</span>
        </div>
      </SidebarMenuButton>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-white/10"
        >
          <div
            className={cn(
              'flex aspect-square size-8 items-center justify-center rounded-lg text-white font-bold',
              isViewingAsUser
                ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                : 'bg-gradient-to-br from-blue-500 to-purple-600',
            )}
          >
            {isViewingAsUser ? <User className="size-4" /> : <Shield className="size-4" />}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-white">
              {selectedUser?.full_name || selectedUser?.email || 'Admin'}
            </span>
            <span className="truncate text-xs text-white/60">
              {isViewingAsUser ? 'Vue utilisateur' : 'Vue admin'}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 text-white/60" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-zinc-900 border-white/10"
        align="start"
        sideOffset={4}
      >
        {/* Global Admin View */}
        <DropdownMenuItem
          onClick={() => setViewAsUser(null)}
          className={cn(
            'text-white/70 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer',
            !isViewingAsUser && 'bg-white/10 text-white',
          )}
        >
          <Shield className="mr-2 h-4 w-4 text-blue-400" />
          <span className="flex-1">Vue admin (tous)</span>
          {!isViewingAsUser && <Check className="ml-2 h-4 w-4 text-green-400" />}
        </DropdownMenuItem>

        {users && users.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <div className="px-2 py-1.5 text-xs text-white/40 font-medium">
              Voir en tant que... ({users.length})
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {users.map((user) => (
                <DropdownMenuItem
                  key={user.user_id}
                  onClick={() => setViewAsUser(user.user_id)}
                  className={cn(
                    'text-white/70 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer',
                    viewAsUserId === user.user_id && 'bg-white/10 text-white',
                  )}
                >
                  <User className="mr-2 h-4 w-4 text-amber-400" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm">{user.full_name || user.email}</div>
                    <div className="truncate text-xs text-white/40">
                      {user.accessible_clients?.join(', ') || 'Aucun client'}
                    </div>
                  </div>
                  {viewAsUserId === user.user_id && (
                    <Check className="ml-2 h-4 w-4 text-green-400 flex-shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          </>
        )}

        {isLoadingUsers && (
          <div className="px-2 py-4 text-center text-sm text-white/40">Chargement...</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
