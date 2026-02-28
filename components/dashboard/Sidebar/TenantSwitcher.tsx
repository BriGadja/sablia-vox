'use client'

import { Building2, Check, ChevronsUpDown, Globe } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { useAccessibleClients } from '@/lib/hooks/useDashboardData'
import { cn } from '@/lib/utils'

interface TenantSwitcherProps {
  isAdmin: boolean
}

/**
 * TenantSwitcher Component
 * Allows admins to switch between global view and client-specific views
 * Selected tenant is stored in URL search params (?tenant=clientId)
 */
export function TenantSwitcher({ isAdmin }: TenantSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTenantId = searchParams.get('tenant')

  // Fetch accessible clients
  const { data: clients, isLoading } = useAccessibleClients()

  // Find current client name
  const currentClient = clients?.find((c) => c.client_id === currentTenantId)

  // Handle tenant selection
  const handleSelectTenant = (clientId: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (clientId) {
      params.set('tenant', clientId)
    } else {
      params.delete('tenant')
    }

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.push(newUrl)
  }

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
              currentTenantId
                ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                : 'bg-gradient-to-br from-blue-500 to-purple-600',
            )}
          >
            {currentTenantId ? <Building2 className="size-4" /> : 'V'}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-white">
              {currentClient?.client_name || 'Sablia Vox'}
            </span>
            <span className="truncate text-xs text-white/60">
              {currentTenantId ? 'Vue client' : 'Vue globale'}
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
          onClick={() => handleSelectTenant(null)}
          className={cn(
            'text-white/70 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer',
            !currentTenantId && 'bg-white/10 text-white',
          )}
        >
          <Globe className="mr-2 h-4 w-4 text-blue-400" />
          <span className="flex-1">Vue globale</span>
          {!currentTenantId && <Check className="ml-2 h-4 w-4 text-green-400" />}
        </DropdownMenuItem>

        {clients && clients.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <div className="px-2 py-1.5 text-xs text-white/40 font-medium">
              Clients ({clients.length})
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {clients.map((client) => (
                <DropdownMenuItem
                  key={client.client_id}
                  onClick={() => handleSelectTenant(client.client_id)}
                  className={cn(
                    'text-white/70 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer',
                    currentTenantId === client.client_id && 'bg-white/10 text-white',
                  )}
                >
                  <Building2 className="mr-2 h-4 w-4 text-amber-400" />
                  <span className="flex-1 truncate">{client.client_name}</span>
                  {currentTenantId === client.client_id && (
                    <Check className="ml-2 h-4 w-4 text-green-400" />
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          </>
        )}

        {isLoading && (
          <div className="px-2 py-4 text-center text-sm text-white/40">Chargement...</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
