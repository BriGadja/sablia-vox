'use client'

import { Building2, Check, ChevronDown, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface Client {
  id: string
  name: string
}

interface MultiClientSelectProps {
  clients: Client[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  placeholder?: string
  isLoading?: boolean
}

export function MultiClientSelect({
  clients,
  selectedIds,
  onChange,
  placeholder = 'Tous les clients',
  isLoading = false,
}: MultiClientSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter clients by search term
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Toggle client selection
  const toggleClient = (clientId: string) => {
    if (selectedIds.includes(clientId)) {
      onChange(selectedIds.filter((id) => id !== clientId))
    } else {
      onChange([...selectedIds, clientId])
    }
  }

  // Select all filtered clients
  const selectAll = () => {
    const filteredIds = filteredClients.map((c) => c.id)
    const newIds = [...new Set([...selectedIds, ...filteredIds])]
    onChange(newIds)
  }

  // Clear all selections
  const clearAll = () => {
    onChange([])
  }

  // Get display text
  const getDisplayText = () => {
    if (selectedIds.length === 0) return placeholder
    if (selectedIds.length === 1) {
      const client = clients.find((c) => c.id === selectedIds[0])
      return client?.name || placeholder
    }
    return `${selectedIds.length} clients`
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          'flex items-center justify-between gap-2 w-full min-w-[180px] px-3 py-2',
          'bg-gray-800/50 border border-gray-700 rounded-lg',
          'text-sm text-gray-200 hover:border-gray-600 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isOpen && 'border-purple-500',
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{getDisplayText()}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {selectedIds.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearAll()
              }}
              className="p-0.5 rounded hover:bg-gray-700"
              title="Effacer la sélection"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
          <ChevronDown
            className={cn('w-4 h-4 text-gray-400 transition-transform', isOpen && 'rotate-180')}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[250px] bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
          {/* Search input */}
          <div className="p-2 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-900/50 border border-gray-700 rounded text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                autoFocus
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-700 text-xs">
            <button onClick={selectAll} className="text-purple-400 hover:text-purple-300">
              Tout sélectionner
            </button>
            <button onClick={clearAll} className="text-gray-400 hover:text-gray-300">
              Effacer
            </button>
          </div>

          {/* Client list */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredClients.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">Aucun client trouvé</div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = selectedIds.includes(client.id)
                return (
                  <button
                    key={client.id}
                    onClick={() => toggleClient(client.id)}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-2 text-sm text-left',
                      'hover:bg-gray-700/50 transition-colors',
                      isSelected && 'bg-purple-500/10',
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                        isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-600',
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={cn('truncate', isSelected ? 'text-white' : 'text-gray-300')}>
                      {client.name}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
