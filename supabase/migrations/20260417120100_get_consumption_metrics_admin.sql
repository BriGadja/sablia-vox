-- vox-admin-consumption: rewrite get_consumption_metrics with admin bypass + multi-org grouping fields.
-- Backup of pre-migration body: supabase/backups/get_consumption_metrics-pre-vox-admin-consumption.sql
-- Phase 0.4 confirmed exactly one prior signature: (date, date).

DROP FUNCTION IF EXISTS public.get_consumption_metrics(date, date);

CREATE OR REPLACE FUNCTION public.get_consumption_metrics(
  p_start_date    date,
  p_end_date      date,
  p_clients_only  boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_is_admin BOOLEAN;
  v_org_ids  UUID[];
BEGIN
  -- v2 canonical admin bypass pattern (mirrors 20260402120000_admin_multiorg_access.sql).
  v_is_admin := COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::BOOLEAN, false);

  IF NOT v_is_admin THEN
    SELECT ARRAY(
      SELECT jsonb_array_elements_text(auth.jwt() -> 'app_metadata' -> 'org_ids')::uuid
    ) INTO v_org_ids;
  END IF;

  RETURN jsonb_build_object(
    'period', jsonb_build_object('start', p_start_date, 'end', p_end_date),
    'by_deployment', (
      WITH accessible_orgs AS (
        SELECT o.id, o.name, o.is_internal, o.billing_client_name
        FROM public.organizations o
        WHERE
          (v_is_admin OR o.id = ANY(v_org_ids))
          AND (NOT p_clients_only OR o.is_internal = false)
      ),
      deployments AS (
        SELECT
          d.id              AS deployment_id,
          d.name            AS agent_name,
          d.cost_per_min,
          d.cost_per_sms,
          ao.id             AS org_id,
          ao.name           AS org_name,
          ao.is_internal,
          ao.billing_client_name,
          at2.type          AS template_type
        FROM public.agent_deployments d
        JOIN accessible_orgs   ao  ON ao.id = d.org_id
        JOIN public.agent_templates at2 ON at2.id = d.template_id
        WHERE d.status = 'active'
      ),
      call_metrics AS (
        SELECT
          c.deployment_id,
          COUNT(*)                                                  AS call_count,
          COUNT(*) FILTER (WHERE c.is_answered = true)              AS answered_calls,
          COALESCE(SUM(c.duration_seconds), 0)                      AS total_seconds,
          COALESCE(SUM(cc.billed_cost), 0)                          AS billed_call_cost
        FROM public.calls c
        LEFT JOIN public.call_costs cc ON cc.call_id = c.id
        WHERE c.started_at::date BETWEEN p_start_date AND p_end_date
        GROUP BY c.deployment_id
      ),
      sms_metrics AS (
        SELECT
          s.deployment_id,
          COUNT(*)                          AS sms_count,
          COALESCE(SUM(s.cost), 0)          AS sms_cost
        FROM public.sms s
        WHERE s.sent_at::date BETWEEN p_start_date AND p_end_date
        GROUP BY s.deployment_id
      ),
      email_metrics AS (
        SELECT
          e.deployment_id,
          COUNT(*)                          AS email_count,
          COALESCE(SUM(e.cost), 0)          AS email_cost
        FROM public.emails e
        WHERE e.sent_at::date BETWEEN p_start_date AND p_end_date
        GROUP BY e.deployment_id
      )
      SELECT COALESCE(jsonb_agg(row_data ORDER BY row_data->>'agent_name'), '[]'::jsonb)
      FROM (
        SELECT jsonb_build_object(
          'deployment_id',       d.deployment_id,
          'agent_name',          d.agent_name,
          'template_type',       d.template_type,
          'org_id',              d.org_id,
          'org_name',            d.org_name,
          'is_internal',         d.is_internal,
          'billing_client_name', d.billing_client_name,
          'call_count',          COALESCE(cm.call_count, 0),
          'answered_calls',      COALESCE(cm.answered_calls, 0),
          'total_seconds',       COALESCE(cm.total_seconds, 0),
          'total_minutes',       ROUND(COALESCE(cm.total_seconds, 0)::numeric / 60.0, 2),
          'billed_call_cost',    COALESCE(cm.billed_call_cost, 0),
          'sms_count',           COALESCE(sm.sms_count, 0),
          'sms_cost',            COALESCE(sm.sms_cost, 0),
          'email_count',         COALESCE(em.email_count, 0),
          'email_cost',          COALESCE(em.email_cost, 0),
          'cost_per_min',        d.cost_per_min,
          'cost_per_sms',        d.cost_per_sms
        ) AS row_data
        FROM deployments d
        LEFT JOIN call_metrics  cm ON cm.deployment_id = d.deployment_id
        LEFT JOIN sms_metrics   sm ON sm.deployment_id = d.deployment_id
        LEFT JOIN email_metrics em ON em.deployment_id = d.deployment_id
      ) sub
    )
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_consumption_metrics(date, date, boolean) TO authenticated;

COMMENT ON FUNCTION public.get_consumption_metrics(date, date, boolean) IS
  'Per-deployment consumption metrics. Admin (app_metadata.is_admin=true) bypasses org filter and sees all orgs; non-admin restricted to app_metadata.org_ids. p_clients_only=true excludes is_internal orgs (Sablia/Charlie). New v2 fields: org_id, org_name, is_internal, billing_client_name, answered_calls, email_count, email_cost.';
