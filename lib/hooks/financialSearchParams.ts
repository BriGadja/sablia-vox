/**
 * Financial Dashboard Search Params Parsers
 * URL-based state management for financial dashboard filters using nuqs
 */

import { format, subDays } from 'date-fns'
import {
  createLoader,
  createSerializer,
  parseAsString,
  parseAsStringLiteral,
  type UrlKeys,
} from 'nuqs/server'

// View mode literals
const viewModes = ['leasing', 'consumption'] as const
export type FinancialViewMode = (typeof viewModes)[number]

// Agent type name is a free-form string (new agent types can be added without code changes)

// Default date range: last 30 days
const getDefaultStartDate = () => format(subDays(new Date(), 30), 'yyyy-MM-dd')
const getDefaultEndDate = () => format(new Date(), 'yyyy-MM-dd')

/**
 * Financial dashboard filter parsers
 * - startDate: Start date in YYYY-MM-DD format
 * - endDate: End date in YYYY-MM-DD format
 * - clientId: Single client UUID filter
 * - agentTypeName: Agent type filter (louis, arthur, alexandra)
 * - deploymentId: Single agent deployment UUID
 * - viewMode: Dashboard view mode (leasing or consumption)
 */
export const financialParsers = {
  startDate: parseAsString.withDefault(getDefaultStartDate()),
  endDate: parseAsString.withDefault(getDefaultEndDate()),
  clientId: parseAsString,
  agentTypeName: parseAsString,
  deploymentId: parseAsString,
  viewMode: parseAsStringLiteral(viewModes).withDefault('leasing'),
}

/**
 * URL key mappings
 */
export const financialUrlKeys: UrlKeys<typeof financialParsers> = {
  startDate: 'startDate',
  endDate: 'endDate',
  clientId: 'clientId',
  agentTypeName: 'agentTypeName',
  deploymentId: 'deploymentId',
  viewMode: 'viewMode',
}

/**
 * Server-side loader for parsing search params
 */
export const loadFinancialParams = createLoader(financialParsers, {
  urlKeys: financialUrlKeys,
})

/**
 * Serializer for creating URLs with financial params
 */
export const serializeFinancialParams = createSerializer(financialParsers, {
  urlKeys: financialUrlKeys,
})
