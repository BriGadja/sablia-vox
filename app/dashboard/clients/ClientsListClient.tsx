'use client'

import { Building2, Loader2, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DateRangeFilter } from '@/components/dashboard/Filters/DateRangeFilter'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { useClientCardsData } from '@/lib/hooks/useDashboardData'
import { useDashboardFilters } from '@/lib/hooks/useDashboardFilters'
import { ClientCard } from './ClientCard'

/**
 * Clients List Client Component (Admin Only)
 * Displays all clients with their aggregated metrics
 */
export function ClientsListClient() {
  // URL-based filters
  const { filters, setDateRange } = useDashboardFilters()

  // Local search state
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch client cards data
  const { data: clients, isLoading } = useClientCardsData(filters)

  // Handle date filter changes
  const handleDateChange = (start: Date, end: Date) => {
    setDateRange(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
  }

  // Filter clients by search query
  const filteredClients = useMemo(() => {
    if (!clients) return []
    if (!searchQuery.trim()) return clients

    const query = searchQuery.toLowerCase()
    return clients.filter(
      (client) =>
        client.client_name.toLowerCase().includes(query) ||
        (client.industry && client.industry.toLowerCase().includes(query)),
    )
  }, [clients, searchQuery])

  // Aggregate stats
  const totalAgents = clients?.reduce((sum, c) => sum + c.total_agents, 0) || 0
  const totalCalls = clients?.reduce((sum, c) => sum + c.total_calls, 0) || 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Clients"
        description={`${clients?.length || 0} client${(clients?.length || 0) > 1 ? 's' : ''} - ${totalAgents} agents - ${totalCalls.toLocaleString()} appels`}
      />

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <DateRangeFilter
          startDate={new Date(filters.startDate)}
          endDate={new Date(filters.endDate)}
          onChange={handleDateChange}
        />

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
      </div>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : filteredClients && filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <ClientCard key={client.client_id} client={client} />
          ))}
        </div>
      ) : clients && clients.length > 0 && searchQuery ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="p-4 rounded-full bg-white/5">
            <Search className="w-12 h-12 text-white/20" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-white">Aucun resultat</p>
            <p className="text-sm text-white/60">
              Aucun client ne correspond a &quot;{searchQuery}&quot;
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="p-4 rounded-full bg-white/5">
            <Building2 className="w-12 h-12 text-white/20" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-white">Aucun client trouve</p>
            <p className="text-sm text-white/60">Il n&apos;y a pas encore de clients enregistres</p>
          </div>
        </div>
      )}
    </div>
  )
}
