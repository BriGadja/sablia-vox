import { createClient } from '@/lib/supabase/client'

export interface QualitySnapshot {
  snapshot_date: string
  call_count: number
  success_rate: number
  avg_quality_score: number
  conversion_rate: number
}

export interface ImprovementSuggestion {
  id: string
  suggestion_type: string
  suggestion_text: string
  status: string
  created_at: string
}

/**
 * Fetch quality snapshots for a deployment over the last N days
 * RLS org-scoped, no RPC needed
 */
export async function fetchQualitySnapshots(
  deploymentId: string,
  days = 30,
): Promise<QualitySnapshot[]> {
  const supabase = createClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('quality_snapshots')
    .select('snapshot_date, call_count, success_rate, avg_quality_score, conversion_rate')
    .eq('deployment_id', deploymentId)
    .gte('snapshot_date', since.toISOString().slice(0, 10))
    .order('snapshot_date', { ascending: true })

  if (error) {
    throw new Error(`Quality snapshots error: ${error.message}`)
  }

  return (data ?? []) as QualitySnapshot[]
}

/**
 * Fetch improvement suggestions for a deployment
 * RLS org-scoped
 */
export async function fetchSuggestions(
  deploymentId: string,
): Promise<ImprovementSuggestion[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('improvement_suggestions')
    .select('id, suggestion_type, suggestion_text, status, created_at')
    .eq('deployment_id', deploymentId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    throw new Error(`Suggestions error: ${error.message}`)
  }

  return (data ?? []) as ImprovementSuggestion[]
}
