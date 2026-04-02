-- Migration: Admin multi-org access
-- Plan: vox-agent-reintegration (Phases A-D)
-- Purpose: Enable Brice (admin) to see all 5 production agents across orgs
-- Root cause: JWT contains single org_id, all RPCs + RLS filter by it

-- ============================================================
-- PHASE A: Auth Hook + JWT Enhancement
-- ============================================================

-- A1: Modify custom_access_token_hook to inject is_admin + org_ids
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
  claims jsonb;
  v_org_id uuid;
  v_is_admin boolean;
  v_org_ids uuid[];
BEGIN
  -- Get the user's default org
  SELECT uom.org_id INTO v_org_id
  FROM public.user_org_memberships uom
  WHERE uom.user_id = (event->>'user_id')::uuid
    AND uom.is_default = true
  LIMIT 1;

  -- Check if user has admin permission on ANY org
  SELECT EXISTS (
    SELECT 1 FROM public.user_org_memberships uom
    WHERE uom.user_id = (event->>'user_id')::uuid
      AND uom.permission_level = 'admin'
  ) INTO v_is_admin;

  -- Get all org_ids for multi-org users
  SELECT ARRAY_AGG(uom.org_id)
  INTO v_org_ids
  FROM public.user_org_memberships uom
  WHERE uom.user_id = (event->>'user_id')::uuid;

  claims := event->'claims';

  IF jsonb_typeof(claims->'app_metadata') IS NULL THEN
    claims := jsonb_set(claims, '{app_metadata}', '{}');
  END IF;

  -- Inject org_id (default org -- backward compatible)
  IF v_org_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{app_metadata,org_id}', to_jsonb(v_org_id::text));
  END IF;

  -- Inject is_admin flag
  claims := jsonb_set(claims, '{app_metadata,is_admin}', to_jsonb(COALESCE(v_is_admin, false)));

  -- Inject org_ids array (for multi-org non-admin users)
  IF v_org_ids IS NOT NULL THEN
    claims := jsonb_set(claims, '{app_metadata,org_ids}', to_jsonb(v_org_ids));
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$function$;

-- A2: Required grants (Supabase custom hook requirement)
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;


-- ============================================================
-- PHASE B: RLS Policy Updates (12 tables)
-- ============================================================

-- Pattern A: admin bypass + org_ids (11 data tables with org_id column)
-- Pattern B: org_ids only, NO admin bypass (organizations table, uses id)

-- B1: agent_deployments (Pattern A)
DROP POLICY IF EXISTS users_select_agent_deployments ON agent_deployments;
CREATE POLICY users_select_agent_deployments ON agent_deployments
  FOR SELECT TO authenticated USING (
    (((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true)
    OR
    (org_id = ANY(
      SELECT jsonb_array_elements_text((SELECT auth.jwt()) -> 'app_metadata' -> 'org_ids')::uuid
    ))
  );

-- B2: calls (Pattern A)
DROP POLICY IF EXISTS users_select_calls ON calls;
CREATE POLICY users_select_calls ON calls
  FOR SELECT TO authenticated USING (
    (((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true)
    OR
    (org_id = ANY(
      SELECT jsonb_array_elements_text((SELECT auth.jwt()) -> 'app_metadata' -> 'org_ids')::uuid
    ))
  );

-- B3: organizations (Pattern B -- NO admin bypass, uses id not org_id)
DROP POLICY IF EXISTS org_read_own ON organizations;
CREATE POLICY org_read_own ON organizations
  FOR SELECT TO authenticated USING (
    id = ANY(
      SELECT jsonb_array_elements_text((SELECT auth.jwt()) -> 'app_metadata' -> 'org_ids')::uuid
    )
  );

-- B4: call_costs (Pattern A)
DROP POLICY IF EXISTS users_select_call_costs ON call_costs;
CREATE POLICY users_select_call_costs ON call_costs
  FOR SELECT TO authenticated USING (
    (((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true)
    OR
    (org_id = ANY(
      SELECT jsonb_array_elements_text((SELECT auth.jwt()) -> 'app_metadata' -> 'org_ids')::uuid
    ))
  );

-- B4: call_contacts (Pattern A)
DROP POLICY IF EXISTS users_select_call_contacts ON call_contacts;
CREATE POLICY users_select_call_contacts ON call_contacts
  FOR SELECT TO authenticated USING (
    (((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true)
    OR
    (org_id = ANY(
      SELECT jsonb_array_elements_text((SELECT auth.jwt()) -> 'app_metadata' -> 'org_ids')::uuid
    ))
  );

-- B4: call_latencies (Pattern A)
DROP POLICY IF EXISTS users_select_call_latencies ON call_latencies;
CREATE POLICY users_select_call_latencies ON call_latencies
  FOR SELECT TO authenticated USING (
    (((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true)
    OR
    (org_id = ANY(
      SELECT jsonb_array_elements_text((SELECT auth.jwt()) -> 'app_metadata' -> 'org_ids')::uuid
    ))
  );

-- B4: call_analyses (Pattern A)
DROP POLICY IF EXISTS users_select_call_analyses ON call_analyses;
CREATE POLICY users_select_call_analyses ON call_analyses
  FOR SELECT TO authenticated USING (
    (((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true)
    OR
    (org_id = ANY(
      SELECT jsonb_array_elements_text((SELECT auth.jwt()) -> 'app_metadata' -> 'org_ids')::uuid
    ))
  );

-- B4: contacts (Pattern A)
DROP POLICY IF EXISTS users_select_contacts ON contacts;
CREATE POLICY users_select_contacts ON contacts
  FOR SELECT TO authenticated USING (
    (((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true)
    OR
    (org_id = ANY(
      SELECT jsonb_array_elements_text((SELECT auth.jwt()) -> 'app_metadata' -> 'org_ids')::uuid
    ))
  );

-- B4: callbacks (Pattern A)
DROP POLICY IF EXISTS users_select_callbacks ON callbacks;
CREATE POLICY users_select_callbacks ON callbacks
  FOR SELECT TO authenticated USING (
    (((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true)
    OR
    (org_id = ANY(
      SELECT jsonb_array_elements_text((SELECT auth.jwt()) -> 'app_metadata' -> 'org_ids')::uuid
    ))
  );

-- B4: sms (Pattern A)
DROP POLICY IF EXISTS users_select_sms ON sms;
CREATE POLICY users_select_sms ON sms
  FOR SELECT TO authenticated USING (
    (((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true)
    OR
    (org_id = ANY(
      SELECT jsonb_array_elements_text((SELECT auth.jwt()) -> 'app_metadata' -> 'org_ids')::uuid
    ))
  );

-- B4: emails (Pattern A)
DROP POLICY IF EXISTS users_select_emails ON emails;
CREATE POLICY users_select_emails ON emails
  FOR SELECT TO authenticated USING (
    (((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true)
    OR
    (org_id = ANY(
      SELECT jsonb_array_elements_text((SELECT auth.jwt()) -> 'app_metadata' -> 'org_ids')::uuid
    ))
  );

-- B4: notifications (Pattern A)
DROP POLICY IF EXISTS users_select_notifications ON notifications;
CREATE POLICY users_select_notifications ON notifications
  FOR SELECT TO authenticated USING (
    (((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true)
    OR
    (org_id = ANY(
      SELECT jsonb_array_elements_text((SELECT auth.jwt()) -> 'app_metadata' -> 'org_ids')::uuid
    ))
  );


-- ============================================================
-- PHASE C: RPC Admin Bypass (5 RPCs)
-- ============================================================

-- C1: get_dashboard_kpis
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis(p_start_date date, p_end_date date, p_deployment_id uuid DEFAULT NULL::uuid, p_template_type text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
  v_is_admin BOOLEAN;
  v_org_ids  UUID[];
  v_interval INTERVAL;
  v_prev_start DATE;
  v_prev_end   DATE;
  v_current  JSONB;
  v_previous JSONB;
BEGIN
  v_is_admin := COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::BOOLEAN, false);

  IF NOT v_is_admin THEN
    SELECT ARRAY(
      SELECT jsonb_array_elements_text(auth.jwt() -> 'app_metadata' -> 'org_ids')::uuid
    ) INTO v_org_ids;
  END IF;

  v_interval   := (p_end_date - p_start_date) * INTERVAL '1 day';
  v_prev_end   := p_start_date - INTERVAL '1 day';
  v_prev_start := (v_prev_end - (p_end_date - p_start_date))::DATE;

  -- Current period
  WITH period_calls AS (
    SELECT
      c.id,
      c.is_answered,
      c.duration_seconds,
      c.outcome,
      at2.type AS template_type,
      cc.billed_cost
    FROM calls c
    JOIN agent_deployments ad  ON ad.id = c.deployment_id
    JOIN agent_templates   at2 ON at2.id = ad.template_id
    LEFT JOIN call_costs   cc  ON cc.call_id = c.id
    WHERE
      (v_is_admin OR c.org_id = ANY(v_org_ids))
      AND c.started_at::DATE BETWEEN p_start_date AND p_end_date
      AND (p_deployment_id IS NULL OR c.deployment_id = p_deployment_id)
      AND (p_template_type IS NULL OR at2.type = p_template_type)
  )
  SELECT jsonb_build_object(
    'total_calls',        COUNT(*),
    'answered_calls',     COUNT(*) FILTER (WHERE is_answered),
    'answer_rate',        ROUND(COUNT(*) FILTER (WHERE is_answered)::NUMERIC / NULLIF(COUNT(*),0) * 100, 1),
    'conversions',        COUNT(*) FILTER (WHERE
                            (template_type = 'setter'    AND outcome = 'appointment_scheduled') OR
                            (template_type = 'secretary' AND outcome IN ('info_provided','question_answered')) OR
                            (template_type = 'transfer'  AND outcome = 'transferred')
                          ),
    'conversion_rate',    ROUND(
                            COUNT(*) FILTER (WHERE
                              (template_type = 'setter'    AND outcome = 'appointment_scheduled') OR
                              (template_type = 'secretary' AND outcome IN ('info_provided','question_answered')) OR
                              (template_type = 'transfer'  AND outcome = 'transferred')
                            )::NUMERIC / NULLIF(COUNT(*),0) * 100, 1
                          ),
    'avg_duration',       ROUND(AVG(duration_seconds), 0),
    'total_billed_cost',  ROUND(COALESCE(SUM(billed_cost), 0)::NUMERIC, 4),
    'avg_billed_cost',    ROUND(COALESCE(AVG(billed_cost), 0)::NUMERIC, 4),
    'voicemail_count',    COUNT(*) FILTER (WHERE outcome = 'voicemail'),
    'no_answer_count',    COUNT(*) FILTER (WHERE outcome = 'no_answer')
  )
  INTO v_current
  FROM period_calls;

  -- Previous period
  WITH prev_calls AS (
    SELECT
      c.id,
      c.is_answered,
      c.duration_seconds,
      c.outcome,
      at2.type AS template_type,
      cc.billed_cost
    FROM calls c
    JOIN agent_deployments ad  ON ad.id = c.deployment_id
    JOIN agent_templates   at2 ON at2.id = ad.template_id
    LEFT JOIN call_costs   cc  ON cc.call_id = c.id
    WHERE
      (v_is_admin OR c.org_id = ANY(v_org_ids))
      AND c.started_at::DATE BETWEEN v_prev_start AND v_prev_end
      AND (p_deployment_id IS NULL OR c.deployment_id = p_deployment_id)
      AND (p_template_type IS NULL OR at2.type = p_template_type)
  )
  SELECT jsonb_build_object(
    'total_calls',        COUNT(*),
    'answered_calls',     COUNT(*) FILTER (WHERE is_answered),
    'answer_rate',        ROUND(COUNT(*) FILTER (WHERE is_answered)::NUMERIC / NULLIF(COUNT(*),0) * 100, 1),
    'conversions',        COUNT(*) FILTER (WHERE
                            (template_type = 'setter'    AND outcome = 'appointment_scheduled') OR
                            (template_type = 'secretary' AND outcome IN ('info_provided','question_answered')) OR
                            (template_type = 'transfer'  AND outcome = 'transferred')
                          ),
    'conversion_rate',    ROUND(
                            COUNT(*) FILTER (WHERE
                              (template_type = 'setter'    AND outcome = 'appointment_scheduled') OR
                              (template_type = 'secretary' AND outcome IN ('info_provided','question_answered')) OR
                              (template_type = 'transfer'  AND outcome = 'transferred')
                            )::NUMERIC / NULLIF(COUNT(*),0) * 100, 1
                          ),
    'avg_duration',       ROUND(AVG(duration_seconds), 0),
    'total_billed_cost',  ROUND(COALESCE(SUM(billed_cost), 0)::NUMERIC, 4),
    'avg_billed_cost',    ROUND(COALESCE(AVG(billed_cost), 0)::NUMERIC, 4),
    'voicemail_count',    COUNT(*) FILTER (WHERE outcome = 'voicemail'),
    'no_answer_count',    COUNT(*) FILTER (WHERE outcome = 'no_answer')
  )
  INTO v_previous
  FROM prev_calls;

  RETURN jsonb_build_object(
    'current_period',  COALESCE(v_current,  '{}'::JSONB),
    'previous_period', COALESCE(v_previous, '{}'::JSONB)
  );
END;
$function$;

-- C2: get_call_volume_by_day
CREATE OR REPLACE FUNCTION public.get_call_volume_by_day(p_start_date date, p_end_date date, p_deployment_id uuid DEFAULT NULL::uuid, p_template_type text DEFAULT NULL::text)
RETURNS TABLE(day date, total_calls bigint, answered_calls bigint, conversions bigint, outbound_calls bigint, inbound_calls bigint, avg_duration numeric)
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
  v_is_admin BOOLEAN;
  v_org_ids  UUID[];
BEGIN
  v_is_admin := COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::BOOLEAN, false);

  IF NOT v_is_admin THEN
    SELECT ARRAY(
      SELECT jsonb_array_elements_text(auth.jwt() -> 'app_metadata' -> 'org_ids')::uuid
    ) INTO v_org_ids;
  END IF;

  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(p_start_date, p_end_date, '1 day'::INTERVAL)::DATE AS d
  ),
  agg AS (
    SELECT
      c.started_at::DATE AS d,
      COUNT(*)                                                     AS total_calls,
      COUNT(*) FILTER (WHERE c.is_answered)                        AS answered_calls,
      COUNT(*) FILTER (WHERE
        (at2.type = 'setter'    AND c.outcome = 'appointment_scheduled') OR
        (at2.type = 'secretary' AND c.outcome IN ('info_provided','question_answered')) OR
        (at2.type = 'transfer'  AND c.outcome = 'transferred')
      )                                                            AS conversions,
      COUNT(*) FILTER (WHERE c.direction = 'outbound')             AS outbound_calls,
      COUNT(*) FILTER (WHERE c.direction = 'inbound')              AS inbound_calls,
      ROUND(AVG(c.duration_seconds), 0)                            AS avg_duration
    FROM calls c
    JOIN agent_deployments ad  ON ad.id = c.deployment_id
    JOIN agent_templates   at2 ON at2.id = ad.template_id
    WHERE
      (v_is_admin OR c.org_id = ANY(v_org_ids))
      AND c.started_at::DATE BETWEEN p_start_date AND p_end_date
      AND (p_deployment_id IS NULL OR c.deployment_id = p_deployment_id)
      AND (p_template_type IS NULL OR at2.type = p_template_type)
    GROUP BY c.started_at::DATE
  )
  SELECT
    ds.d,
    COALESCE(agg.total_calls, 0),
    COALESCE(agg.answered_calls, 0),
    COALESCE(agg.conversions, 0),
    COALESCE(agg.outbound_calls, 0),
    COALESCE(agg.inbound_calls, 0),
    COALESCE(agg.avg_duration, 0)
  FROM date_series ds
  LEFT JOIN agg ON agg.d = ds.d
  ORDER BY ds.d ASC;
END;
$function$;

-- C3: get_outcome_distribution
CREATE OR REPLACE FUNCTION public.get_outcome_distribution(p_start_date date, p_end_date date, p_deployment_id uuid DEFAULT NULL::uuid, p_template_type text DEFAULT NULL::text)
RETURNS TABLE(outcome text, count bigint, percentage numeric, avg_duration numeric, total_cost numeric)
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
  v_is_admin BOOLEAN;
  v_org_ids  UUID[];
BEGIN
  v_is_admin := COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::BOOLEAN, false);

  IF NOT v_is_admin THEN
    SELECT ARRAY(
      SELECT jsonb_array_elements_text(auth.jwt() -> 'app_metadata' -> 'org_ids')::uuid
    ) INTO v_org_ids;
  END IF;

  RETURN QUERY
  WITH totals AS (
    SELECT COUNT(*) AS grand_total
    FROM calls c
    JOIN agent_deployments ad  ON ad.id = c.deployment_id
    JOIN agent_templates   at2 ON at2.id = ad.template_id
    WHERE
      (v_is_admin OR c.org_id = ANY(v_org_ids))
      AND c.started_at::DATE BETWEEN p_start_date AND p_end_date
      AND (p_deployment_id IS NULL OR c.deployment_id = p_deployment_id)
      AND (p_template_type IS NULL OR at2.type = p_template_type)
      AND c.outcome IS NOT NULL
  ),
  agg AS (
    SELECT
      c.outcome,
      COUNT(*)                          AS cnt,
      ROUND(AVG(c.duration_seconds), 0) AS avg_dur,
      ROUND(COALESCE(SUM(cc.billed_cost), 0)::NUMERIC, 4) AS total_c
    FROM calls c
    JOIN agent_deployments ad  ON ad.id = c.deployment_id
    JOIN agent_templates   at2 ON at2.id = ad.template_id
    LEFT JOIN call_costs   cc  ON cc.call_id = c.id
    WHERE
      (v_is_admin OR c.org_id = ANY(v_org_ids))
      AND c.started_at::DATE BETWEEN p_start_date AND p_end_date
      AND (p_deployment_id IS NULL OR c.deployment_id = p_deployment_id)
      AND (p_template_type IS NULL OR at2.type = p_template_type)
      AND c.outcome IS NOT NULL
    GROUP BY c.outcome
  )
  SELECT
    agg.outcome,
    agg.cnt,
    ROUND(agg.cnt::NUMERIC / NULLIF(totals.grand_total, 0) * 100, 1),
    agg.avg_dur,
    agg.total_c
  FROM agg, totals
  ORDER BY agg.cnt DESC;
END;
$function$;

-- C4: get_agent_cards_data
CREATE OR REPLACE FUNCTION public.get_agent_cards_data(p_start_date date DEFAULT ((now() - '30 days'::interval))::date, p_end_date date DEFAULT (now())::date, p_template_type text DEFAULT NULL::text)
RETURNS TABLE(deployment_id uuid, deployment_name text, slug text, deployment_status text, phone_number text, dipler_agent_id text, template_type text, template_display_name text, total_calls bigint, answered_calls bigint, conversions bigint, answer_rate numeric, conversion_rate numeric, avg_duration numeric, total_billed_cost numeric, avg_billed_cost numeric, last_call_at timestamp with time zone, created_at timestamp with time zone)
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
  v_is_admin BOOLEAN;
  v_org_ids  UUID[];
BEGIN
  v_is_admin := COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::BOOLEAN, false);

  IF NOT v_is_admin THEN
    SELECT ARRAY(
      SELECT jsonb_array_elements_text(auth.jwt() -> 'app_metadata' -> 'org_ids')::uuid
    ) INTO v_org_ids;
  END IF;

  RETURN QUERY
  SELECT
    ad.id,
    ad.name,
    ad.slug,
    ad.status,
    ad.phone_number,
    ad.dipler_agent_id,
    at2.type,
    at2.display_name,
    COUNT(c.id)                                                  AS total_calls,
    COUNT(c.id) FILTER (WHERE c.is_answered)                     AS answered_calls,
    COUNT(c.id) FILTER (WHERE
      (at2.type = 'setter'    AND c.outcome = 'appointment_scheduled') OR
      (at2.type = 'secretary' AND c.outcome IN ('info_provided','question_answered')) OR
      (at2.type = 'transfer'  AND c.outcome = 'transferred')
    )                                                            AS conversions,
    ROUND(
      COUNT(c.id) FILTER (WHERE c.is_answered)::NUMERIC
      / NULLIF(COUNT(c.id), 0) * 100, 1
    )                                                            AS answer_rate,
    ROUND(
      COUNT(c.id) FILTER (WHERE
        (at2.type = 'setter'    AND c.outcome = 'appointment_scheduled') OR
        (at2.type = 'secretary' AND c.outcome IN ('info_provided','question_answered')) OR
        (at2.type = 'transfer'  AND c.outcome = 'transferred')
      )::NUMERIC / NULLIF(COUNT(c.id), 0) * 100, 1
    )                                                            AS conversion_rate,
    ROUND(AVG(c.duration_seconds), 0)                            AS avg_duration,
    ROUND(COALESCE(SUM(cc.billed_cost), 0)::NUMERIC, 4)         AS total_billed_cost,
    ROUND(COALESCE(AVG(cc.billed_cost), 0)::NUMERIC, 4)         AS avg_billed_cost,
    MAX(c.started_at)                                            AS last_call_at,
    ad.created_at
  FROM agent_deployments ad
  JOIN agent_templates at2 ON at2.id = ad.template_id
  LEFT JOIN calls c ON (
    c.deployment_id = ad.id
    AND c.started_at::DATE BETWEEN p_start_date AND p_end_date
  )
  LEFT JOIN call_costs cc ON cc.call_id = c.id
  WHERE
    (v_is_admin OR ad.org_id = ANY(v_org_ids))
    AND (p_template_type IS NULL OR at2.type = p_template_type)
  GROUP BY ad.id, ad.name, ad.slug, ad.status, ad.phone_number, ad.dipler_agent_id,
           at2.type, at2.display_name, ad.created_at
  ORDER BY ad.name ASC;
END;
$function$;

-- C5: get_calls_page
CREATE OR REPLACE FUNCTION public.get_calls_page(p_start_date date, p_end_date date, p_deployment_id uuid DEFAULT NULL::uuid, p_template_type text DEFAULT NULL::text, p_outcome text DEFAULT NULL::text, p_direction text DEFAULT NULL::text, p_search_phone text DEFAULT NULL::text, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
  v_is_admin BOOLEAN;
  v_org_ids  UUID[];
  v_total    BIGINT;
  v_rows     JSONB;
BEGIN
  v_is_admin := COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::BOOLEAN, false);

  IF NOT v_is_admin THEN
    SELECT ARRAY(
      SELECT jsonb_array_elements_text(auth.jwt() -> 'app_metadata' -> 'org_ids')::uuid
    ) INTO v_org_ids;
  END IF;

  -- Count
  SELECT COUNT(*)
  INTO v_total
  FROM calls c
  JOIN agent_deployments ad  ON ad.id = c.deployment_id
  JOIN agent_templates   at2 ON at2.id = ad.template_id
  WHERE
    (v_is_admin OR c.org_id = ANY(v_org_ids))
    AND c.started_at::DATE BETWEEN p_start_date AND p_end_date
    AND (p_deployment_id IS NULL OR c.deployment_id = p_deployment_id)
    AND (p_template_type IS NULL OR at2.type = p_template_type)
    AND (p_outcome IS NULL OR c.outcome = p_outcome)
    AND (p_direction IS NULL OR c.direction = p_direction)
    AND (p_search_phone IS NULL OR c.phone_number LIKE '%' || p_search_phone || '%');

  -- Data page
  SELECT jsonb_agg(row_data ORDER BY (row_data->>'started_at') DESC)
  INTO v_rows
  FROM (
    SELECT jsonb_build_object(
      'call_id',              c.id,
      'deployment_id',        c.deployment_id,
      'deployment_name',      ad.name,
      'deployment_slug',      ad.slug,
      'template_type',        at2.type,
      'template_display_name',at2.display_name,
      'direction',            c.direction,
      'outcome',              c.outcome,
      'call_status',          c.call_status,
      'is_answered',          c.is_answered,
      'is_conversion',        CASE at2.type
                                WHEN 'setter'    THEN (c.outcome = 'appointment_scheduled')
                                WHEN 'secretary' THEN (c.outcome IN ('info_provided','question_answered'))
                                WHEN 'transfer'  THEN (c.outcome = 'transferred')
                                ELSE FALSE
                              END,
      'duration_seconds',     c.duration_seconds,
      'phone_number',         c.phone_number,
      'first_name',           con.first_name,
      'last_name',            con.last_name,
      'contact_email',        con.email,
      'emotion',              c.emotion,
      'billed_cost',          cc.billed_cost,
      'quality_score',        ca.quality_score,
      'call_reason',          c.call_reason,
      'attempt_number',       c.attempt_number,
      'started_at',           c.started_at,
      'ended_at',             c.ended_at,
      'provider',             c.provider
    ) AS row_data
    FROM calls c
    JOIN agent_deployments ad  ON ad.id = c.deployment_id
    JOIN agent_templates   at2 ON at2.id = ad.template_id
    LEFT JOIN call_costs    cc  ON cc.call_id = c.id
    LEFT JOIN call_analyses ca  ON ca.call_id = c.id
    LEFT JOIN LATERAL (
      SELECT con2.first_name, con2.last_name, con2.email
      FROM call_contacts cc2
      JOIN contacts con2 ON con2.id = cc2.contact_id
      WHERE cc2.call_id = c.id
      ORDER BY cc2.created_at ASC
      LIMIT 1
    ) con ON TRUE
    WHERE
      (v_is_admin OR c.org_id = ANY(v_org_ids))
      AND c.started_at::DATE BETWEEN p_start_date AND p_end_date
      AND (p_deployment_id IS NULL OR c.deployment_id = p_deployment_id)
      AND (p_template_type IS NULL OR at2.type = p_template_type)
      AND (p_outcome IS NULL OR c.outcome = p_outcome)
      AND (p_direction IS NULL OR c.direction = p_direction)
      AND (p_search_phone IS NULL OR c.phone_number LIKE '%' || p_search_phone || '%')
    ORDER BY c.started_at DESC
    LIMIT p_limit OFFSET p_offset
  ) sub;

  RETURN jsonb_build_object(
    'total',  v_total,
    'data',   COALESCE(v_rows, '[]'::JSONB)
  );
END;
$function$;


-- ============================================================
-- PHASE D: Data -- Multi-Org Memberships
-- ============================================================

-- D1: Add Brice to all 4 client orgs (already has Sablia as admin, is_default=true)
INSERT INTO user_org_memberships (user_id, org_id, permission_level, is_default) VALUES
  ('c6ca172c-f453-41ed-b0aa-4b3c4c37a0aa', '986c593d-30d7-4912-b41a-e2781c8b018a', 'admin', false),  -- Norloc
  ('c6ca172c-f453-41ed-b0aa-4b3c4c37a0aa', '855c1aa5-318c-41d4-b403-8113bc65d8fc', 'admin', false),  -- Exotic Design
  ('c6ca172c-f453-41ed-b0aa-4b3c4c37a0aa', '14e4f42a-6eca-4307-ac79-ea3dbb4751ff', 'admin', false),  -- Stefano Design
  ('c6ca172c-f453-41ed-b0aa-4b3c4c37a0aa', 'f7341a5f-f075-41ef-bc4b-eb7e3e86427b', 'admin', false)   -- Nestenn
ON CONFLICT (user_id, org_id) DO NOTHING;
