/**
 * Admin Calls Search Params Parsers
 * URL-based state management for admin calls table filters using nuqs
 */

import { format, subDays } from 'date-fns'
import {
  createLoader,
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  type UrlKeys,
} from 'nuqs/server'

// Agent type is a free-form string (new agent types can be added without code changes)

// Emotion literals
const emotions = ['positive', 'neutral', 'negative'] as const

// Direction literals
const directions = ['inbound', 'outbound'] as const

// Sort direction literals
const sortDirections = ['asc', 'desc'] as const

// Default date range: last 30 days
const getDefaultStartDate = () => format(subDays(new Date(), 30), 'yyyy-MM-dd')
const getDefaultEndDate = () => format(new Date(), 'yyyy-MM-dd')

/**
 * Admin calls filter parsers
 */
export const adminCallsParsers = {
  // Date range
  startDate: parseAsString.withDefault(getDefaultStartDate()),
  endDate: parseAsString.withDefault(getDefaultEndDate()),

  // Filters
  clientIds: parseAsArrayOf(parseAsString).withDefault([]),
  agentType: parseAsString,
  deploymentId: parseAsString,
  outcomes: parseAsArrayOf(parseAsString).withDefault([]),
  emotion: parseAsStringLiteral(emotions),
  direction: parseAsStringLiteral(directions),
  search: parseAsString.withDefault(''),

  // Pagination
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(50),

  // Sorting
  sortColumn: parseAsString.withDefault('started_at'),
  sortDirection: parseAsStringLiteral(sortDirections).withDefault('desc'),
}

/**
 * URL key mappings (shorter keys for cleaner URLs)
 */
export const adminCallsUrlKeys: UrlKeys<typeof adminCallsParsers> = {
  startDate: 'from',
  endDate: 'to',
  clientIds: 'clients',
  agentType: 'type',
  deploymentId: 'agent',
  outcomes: 'outcomes',
  emotion: 'emotion',
  direction: 'dir',
  search: 'q',
  page: 'p',
  pageSize: 'size',
  sortColumn: 'sort',
  sortDirection: 'order',
}

/**
 * Server-side loader for parsing search params
 */
export const loadAdminCallsParams = createLoader(adminCallsParsers, {
  urlKeys: adminCallsUrlKeys,
})

/**
 * Serializer for creating URLs with admin calls params
 */
export const serializeAdminCallsParams = createSerializer(adminCallsParsers, {
  urlKeys: adminCallsUrlKeys,
})

/**
 * Type for parsed admin calls params
 */
export type AdminCallsParams = ReturnType<typeof loadAdminCallsParams>
