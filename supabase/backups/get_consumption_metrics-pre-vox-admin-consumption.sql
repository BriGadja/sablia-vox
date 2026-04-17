-- Backup of get_consumption_metrics as of 2026-04-17, pre vox-admin-consumption migration.
-- Restore with: DROP FUNCTION IF EXISTS public.get_consumption_metrics(...); then run this file.
-- Single signature captured: (p_start_date date, p_end_date date)

CREATE OR REPLACE FUNCTION public.get_consumption_metrics(p_start_date date, p_end_date date)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
  v_org_id uuid;
BEGIN
  v_org_id := ((auth.jwt() -> 'app_metadata' ->> 'org_id'))::uuid;

  RETURN jsonb_build_object(
    'period', jsonb_build_object('start', p_start_date, 'end', p_end_date),
    'by_deployment', (
      SELECT COALESCE(jsonb_agg(row_data ORDER BY row_data->>'agent_name'), '[]'::jsonb)
      FROM (
        SELECT jsonb_build_object(
          'deployment_id', d.id,
          'agent_name', d.name,
          'template_type', at2.type,
          'call_count', COALESCE(ca.call_count, 0),
          'total_seconds', COALESCE(ca.total_seconds, 0),
          'total_minutes', ROUND(COALESCE(ca.total_seconds, 0)::numeric / 60.0, 2),
          'billed_call_cost', COALESCE(ca.billed_call_cost, 0),
          'sms_count', COALESCE(sa.sms_count, 0),
          'sms_cost', COALESCE(sa.sms_cost, 0),
          'cost_per_min', d.cost_per_min,
          'cost_per_sms', d.cost_per_sms
        ) AS row_data
        FROM agent_deployments d
        JOIN agent_templates at2 ON at2.id = d.template_id
        LEFT JOIN LATERAL (
          SELECT
            COUNT(c.id) AS call_count,
            COALESCE(SUM(c.duration_seconds), 0) AS total_seconds,
            COALESCE(SUM(cc.billed_cost), 0) AS billed_call_cost
          FROM calls c
          LEFT JOIN call_costs cc ON cc.call_id = c.id
          WHERE c.deployment_id = d.id
            AND c.started_at::date BETWEEN p_start_date AND p_end_date
        ) ca ON true
        LEFT JOIN LATERAL (
          SELECT
            COUNT(s.id) AS sms_count,
            COALESCE(SUM(s.cost), 0) AS sms_cost
          FROM sms s
          WHERE s.deployment_id = d.id
            AND s.sent_at::date BETWEEN p_start_date AND p_end_date
        ) sa ON true
        WHERE d.org_id = v_org_id
          AND d.status = 'active'
      ) sub
    )
  );
END;
$function$;
