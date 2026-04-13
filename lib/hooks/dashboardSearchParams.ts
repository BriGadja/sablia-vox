/**
 * Dashboard Search Params Parsers — v2
 * Shared parser definitions for dashboard filters using nuqs
 */

import { format, subDays } from 'date-fns'
import { createLoader, createSerializer, parseAsString, type UrlKeys } from 'nuqs/server'

// Default date range: last 30 days
const getDefaultStartDate = () => format(subDays(new Date(), 30), 'yyyy-MM-dd')
const getDefaultEndDate = () => format(new Date(), 'yyyy-MM-dd')

/**
 * Dashboard filter parsers — v2
 * - deploymentId: Single agent deployment UUID
 * - templateType: Template type filter (setter, secretary, transfer)
 * - startDate: Start date in YYYY-MM-DD format
 * - endDate: End date in YYYY-MM-DD format
 */
export const dashboardParsers = {
  deploymentId: parseAsString,
  templateType: parseAsString,
  startDate: parseAsString.withDefault(getDefaultStartDate()),
  endDate: parseAsString.withDefault(getDefaultEndDate()),
}

/**
 * URL key mappings (optional, for shorter URLs)
 */
export const dashboardUrlKeys: UrlKeys<typeof dashboardParsers> = {
  deploymentId: 'deploymentId',
  templateType: 'templateType',
  startDate: 'startDate',
  endDate: 'endDate',
}

/**
 * Server-side loader for parsing search params
 */
export const loadDashboardParams = createLoader(dashboardParsers, {
  urlKeys: dashboardUrlKeys,
})

/**
 * Serializer for creating URLs with dashboard params
 */
export const serializeDashboardParams = createSerializer(dashboardParsers, {
  urlKeys: dashboardUrlKeys,
})
