/**
 * Dashboard Search Params Parsers
 * Shared parser definitions for dashboard filters using nuqs
 * Can be used in both server and client components
 */

import { format, subDays } from 'date-fns'
import {
  createLoader,
  createSerializer,
  parseAsArrayOf,
  parseAsString,
  type UrlKeys,
} from 'nuqs/server'

// Agent type name is a free-form string (new agent types can be added without code changes)

// Default date range: last 30 days
const getDefaultStartDate = () => format(subDays(new Date(), 30), 'yyyy-MM-dd')
const getDefaultEndDate = () => format(new Date(), 'yyyy-MM-dd')

/**
 * Dashboard filter parsers
 * - viewAsUser: User ID for admin "view as user" feature (takes precedence over clientIds)
 * - clientIds: Comma-separated client IDs
 * - deploymentId: Single agent deployment UUID
 * - agentTypeName: Agent type filter (louis, arthur, alexandra)
 * - startDate: Start date in YYYY-MM-DD format
 * - endDate: End date in YYYY-MM-DD format
 */
export const dashboardParsers = {
  viewAsUser: parseAsString,
  clientIds: parseAsArrayOf(parseAsString, ','),
  deploymentId: parseAsString,
  agentTypeName: parseAsString,
  startDate: parseAsString.withDefault(getDefaultStartDate()),
  endDate: parseAsString.withDefault(getDefaultEndDate()),
}

/**
 * URL key mappings (optional, for shorter URLs)
 */
export const dashboardUrlKeys: UrlKeys<typeof dashboardParsers> = {
  viewAsUser: 'viewAsUser',
  clientIds: 'clientIds',
  deploymentId: 'deploymentId',
  agentTypeName: 'agentTypeName',
  startDate: 'startDate',
  endDate: 'endDate',
}

/**
 * Server-side loader for parsing search params
 * Use in server components and API routes
 */
export const loadDashboardParams = createLoader(dashboardParsers, {
  urlKeys: dashboardUrlKeys,
})

/**
 * Serializer for creating URLs with dashboard params
 * Use for navigation links
 */
export const serializeDashboardParams = createSerializer(dashboardParsers, {
  urlKeys: dashboardUrlKeys,
})
