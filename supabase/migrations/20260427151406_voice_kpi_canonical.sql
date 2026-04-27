-- =============================================================================
-- Voice KPI canonical propagation (2026-04-27)
-- =============================================================================
-- Aligns sablia-voice dashboard SQL (1 view + 1 view-derived flag + 3 RPCs) with
-- the canonical KPI definitions from the voice-weekly-report skill.
--
-- SSOT: voice-infrastructure/docs/schema/DATABASE.md § Métriques canoniques
-- Plan: plans/voice-kpi-canonical-propagation.md (challenge: 4 rounds, GO)
--
-- Canonical formulas (verbatim from SSOT, duplicated inline at each KPI site for
-- audit-by-grep — intentional choice over a generated column on calls; rationale
-- in plan Phase A § Technical Details):
--
--   * Décroché (denominator for conversion rate, lenient):
--     outcome IS NOT NULL
--       AND outcome NOT IN ('voicemail','no_answer','hangup','call_failed')
--     ('hangup' is defensive-only; not in current 23-value CHECK enum.)
--
--   * Conversion outcomes (5, flat list — no per-template CASE):
--     outcome IN ('appointment_scheduled','transfer_completed','transferred',
--                 'info_provided','information_provided')
--
--   * Quality scope (excludes voicemails — no conversation to evaluate):
--     AVG(quality_score) FILTER (WHERE is_voicemail = false)
--
-- Distinction with calls.is_answered (kept untouched):
--   is_answered is a STORED generated column with a STRICT exclusion list
--   (excludes busy/rejected/too_short/canceled/invalid_number/error/not_available/
--   spam/wrong_number in addition to voicemail/no_answer/call_failed).
--   It is consumed by retry-logic (retry_configs.retry_on_outcomes) and other
--   non-KPI consumers. Do NOT change its semantics. The KPI "décroché" is
--   intentionally more lenient.
--
-- RPC update strategy (verified live 2026-04-27 via pg_proc):
--   * get_dashboard_kpis returns jsonb -> CREATE OR REPLACE (return type
--     unchanged when adding quality_score_avg as a new key; grants preserved).
--   * get_call_volume_by_day returns TABLE -> DROP + CREATE + 5-grantee GRANT
--     (adding decroche_calls + quality_score_avg changes TABLE shape).
--   * get_agent_cards_data returns TABLE -> DROP + CREATE + 5-grantee GRANT
--     (adding quality_score_avg changes TABLE shape).
--
-- Views: DROP CASCADE + CREATE WITH (security_invoker = true).
-- pg_depend confirmed zero dependents on either view as of 2026-04-27.
-- security_invoker is RE-pinned in DDL even though already true on live, as
-- defense against Supabase Dashboard bug #35823 (silent reset on UI edits).
--
-- Behavioral changes (intentional):
--   * question_answered drops out of conversion list (was mapped under
--     secretary in prior CASE; not in canonical list per Brice 2026-04-27).
--   * Conversion rate denominator switches from total_calls to décroché count
--     -> historical conversion_rate values will RISE (smaller denominator).
--   * appointment_scheduled now counted for ALL templates (not just setter)
--     -> Norloc Louis week 2026-04-20 conv_rate goes from 0.0% to ~5.6%.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. v_dashboard_calls — flat is_conversion using canonical 5-outcome IN list
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS public.v_dashboard_calls CASCADE;

CREATE VIEW public.v_dashboard_calls
WITH (security_invoker = true)
AS
SELECT c.id AS call_id,
    c.org_id,
    c.deployment_id,
    c.dipler_conversation_id,
    c.direction,
    c.outcome,
    c.call_status,
    c.is_answered,
    c.call_reason,
    c.attempt_number,
    c.started_at,
    c.ended_at,
    c.duration_seconds,
    c.phone_number,
    c.provider,
    c.call_sid,
    c.transcript,
    c.summary,
    c.emotion,
    c.recording_url,
    c.context_info,
    cc.billed_cost,
    cc.total_cost AS dipler_cost,
    cc.telecom_cost,
    cc.margin,
    ca.quality_score,
    ca.sentiment,
    ca.is_voicemail,
    ca.extracted_data,
    ca.tags,
    ca.analysis_text,
    cl.avg_llm_ms,
    cl.avg_tts_ms,
    cl.avg_total_ms,
    ad.name AS deployment_name,
    ad.slug AS deployment_slug,
    ad.status AS deployment_status,
    ad.phone_number AS deployment_phone,
    ad.cost_per_min,
    at2.type AS template_type,
    at2.display_name AS template_display_name,
    con.first_name,
    con.last_name,
    con.email AS contact_email,
    -- Canonical conversion (5 outcomes, flat — was CASE per template_type pre-2026-04-27)
    (c.outcome IN ('appointment_scheduled','transfer_completed','transferred','info_provided','information_provided')) AS is_conversion,
    c.created_at,
    c.updated_at
FROM ((((((calls c
  JOIN agent_deployments ad ON ((ad.id = c.deployment_id)))
  JOIN agent_templates at2 ON ((at2.id = ad.template_id)))
  LEFT JOIN call_costs cc ON ((cc.call_id = c.id)))
  LEFT JOIN call_latencies cl ON ((cl.call_id = c.id)))
  LEFT JOIN call_analyses ca ON ((ca.call_id = c.id)))
  LEFT JOIN LATERAL (
    SELECT con2.first_name, con2.last_name, con2.email
    FROM (call_contacts cc2 JOIN contacts con2 ON ((con2.id = cc2.contact_id)))
    WHERE (cc2.call_id = c.id)
    ORDER BY cc2.created_at
    LIMIT 1
  ) con ON (true));

-- -----------------------------------------------------------------------------
-- 2. v_agent_30d_stats — inline canonical filters + quality_score_avg
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS public.v_agent_30d_stats CASCADE;

CREATE VIEW public.v_agent_30d_stats
WITH (security_invoker = true)
AS
SELECT c.deployment_id,
    c.org_id,
    count(*) AS total_calls_30d,
    -- Décroché (canonical, lenient) — replaces is_answered (strict)
    count(*) FILTER (WHERE c.outcome IS NOT NULL
                       AND c.outcome NOT IN ('voicemail','no_answer','hangup','call_failed'))
        AS answered_calls_30d,
    count(*) FILTER (WHERE c.outcome = 'voicemail') AS voicemail_calls_30d,
    -- Conversion: 5 canonical outcomes, flat list (was per-template CASE)
    count(*) FILTER (WHERE c.outcome IN ('appointment_scheduled','transfer_completed','transferred','info_provided','information_provided'))
        AS conversions_30d,
    -- answer_rate = décroché / total
    round(
        (count(*) FILTER (WHERE c.outcome IS NOT NULL
                            AND c.outcome NOT IN ('voicemail','no_answer','hangup','call_failed')))::numeric
        / NULLIF(count(*), 0)::numeric * 100,
        1
    ) AS answer_rate_30d,
    -- conversion_rate denominator = décroché count (per canonical SSOT, NOT total_calls)
    round(
        (count(*) FILTER (WHERE c.outcome IN ('appointment_scheduled','transfer_completed','transferred','info_provided','information_provided')))::numeric
        / NULLIF(count(*) FILTER (WHERE c.outcome IS NOT NULL
                                     AND c.outcome NOT IN ('voicemail','no_answer','hangup','call_failed')), 0)::numeric * 100,
        1
    ) AS conversion_rate_30d,
    round(avg(c.duration_seconds), 0) AS avg_duration_30d,
    sum(cc.billed_cost) AS total_billed_cost_30d,
    -- Quality (voicemails excluded per canonical SSOT)
    round(avg(ca.quality_score) FILTER (WHERE ca.is_voicemail = false)::numeric, 2)
        AS quality_score_avg_30d,
    max(c.started_at) AS last_call_at
FROM ((((calls c
  JOIN agent_deployments ad ON ((ad.id = c.deployment_id)))
  JOIN agent_templates at2 ON ((at2.id = ad.template_id)))
  LEFT JOIN call_costs cc ON ((cc.call_id = c.id)))
  LEFT JOIN call_analyses ca ON ((ca.call_id = c.id)))
WHERE (c.started_at >= (now() - '30 days'::interval))
GROUP BY c.deployment_id, c.org_id;

-- -----------------------------------------------------------------------------
-- 3. get_dashboard_kpis (jsonb) — CREATE OR REPLACE: adds quality_score_avg key
--    No DROP needed (jsonb return type unchanged); grants preserved.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis(
  p_start_date date,
  p_end_date date,
  p_deployment_id uuid DEFAULT NULL,
  p_template_type text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql STABLE AS $function$
DECLARE
  v_is_admin   BOOLEAN;
  v_org_ids    UUID[];
  v_prev_start DATE;
  v_prev_end   DATE;
  v_current    JSONB;
  v_previous   JSONB;
BEGIN
  v_is_admin := COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::BOOLEAN, false);
  IF NOT v_is_admin THEN
    SELECT ARRAY(
      SELECT jsonb_array_elements_text(auth.jwt() -> 'app_metadata' -> 'org_ids')::uuid
    ) INTO v_org_ids;
  END IF;

  v_prev_end   := p_start_date - INTERVAL '1 day';
  v_prev_start := (v_prev_end - (p_end_date - p_start_date))::DATE;

  WITH period_calls AS (
    SELECT c.id, c.duration_seconds, c.outcome,
           at2.type AS template_type, cc.billed_cost,
           ca.quality_score, ca.is_voicemail
    FROM calls c
    JOIN agent_deployments ad  ON ad.id = c.deployment_id
    JOIN agent_templates   at2 ON at2.id = ad.template_id
    LEFT JOIN call_costs   cc  ON cc.call_id = c.id
    LEFT JOIN call_analyses ca ON ca.call_id = c.id
    WHERE (v_is_admin OR c.org_id = ANY(v_org_ids))
      AND c.started_at::DATE BETWEEN p_start_date AND p_end_date
      AND (p_deployment_id IS NULL OR c.deployment_id = p_deployment_id)
      AND (p_template_type IS NULL OR at2.type = p_template_type)
  )
  SELECT jsonb_build_object(
    'total_calls',        COUNT(*),
    -- Décroché (canonical, lenient)
    'answered_calls',     COUNT(*) FILTER (WHERE outcome IS NOT NULL
                                             AND outcome NOT IN ('voicemail','no_answer','hangup','call_failed')),
    -- answer_rate denominator = total_calls (rate of calls reaching a human)
    'answer_rate',        ROUND(
                            COUNT(*) FILTER (WHERE outcome IS NOT NULL
                                               AND outcome NOT IN ('voicemail','no_answer','hangup','call_failed'))::NUMERIC
                            / NULLIF(COUNT(*),0) * 100, 1),
    -- Conversions: 5 canonical outcomes, flat list (no per-template CASE)
    'conversions',        COUNT(*) FILTER (WHERE outcome IN ('appointment_scheduled','transfer_completed','transferred','info_provided','information_provided')),
    -- conversion_rate denominator = décroché count (per canonical SSOT)
    'conversion_rate',    ROUND(
                            COUNT(*) FILTER (WHERE outcome IN ('appointment_scheduled','transfer_completed','transferred','info_provided','information_provided'))::NUMERIC
                            / NULLIF(COUNT(*) FILTER (WHERE outcome IS NOT NULL
                                                        AND outcome NOT IN ('voicemail','no_answer','hangup','call_failed')), 0) * 100,
                            1),
    'avg_duration',       ROUND(AVG(duration_seconds), 0),
    'total_billed_cost',  ROUND(COALESCE(SUM(billed_cost), 0)::NUMERIC, 4),
    'avg_billed_cost',    ROUND(COALESCE(AVG(billed_cost), 0)::NUMERIC, 4),
    -- Quality (voicemails excluded per canonical SSOT) — new key, additive
    'quality_score_avg',  ROUND(AVG(quality_score) FILTER (WHERE is_voicemail = false)::NUMERIC, 2),
    'voicemail_count',    COUNT(*) FILTER (WHERE outcome = 'voicemail'),
    'no_answer_count',    COUNT(*) FILTER (WHERE outcome = 'no_answer')
  ) INTO v_current FROM period_calls;

  WITH period_calls AS (
    SELECT c.id, c.duration_seconds, c.outcome,
           at2.type AS template_type, cc.billed_cost,
           ca.quality_score, ca.is_voicemail
    FROM calls c
    JOIN agent_deployments ad  ON ad.id = c.deployment_id
    JOIN agent_templates   at2 ON at2.id = ad.template_id
    LEFT JOIN call_costs   cc  ON cc.call_id = c.id
    LEFT JOIN call_analyses ca ON ca.call_id = c.id
    WHERE (v_is_admin OR c.org_id = ANY(v_org_ids))
      AND c.started_at::DATE BETWEEN v_prev_start AND v_prev_end
      AND (p_deployment_id IS NULL OR c.deployment_id = p_deployment_id)
      AND (p_template_type IS NULL OR at2.type = p_template_type)
  )
  SELECT jsonb_build_object(
    'total_calls',        COUNT(*),
    'answered_calls',     COUNT(*) FILTER (WHERE outcome IS NOT NULL
                                             AND outcome NOT IN ('voicemail','no_answer','hangup','call_failed')),
    'answer_rate',        ROUND(
                            COUNT(*) FILTER (WHERE outcome IS NOT NULL
                                               AND outcome NOT IN ('voicemail','no_answer','hangup','call_failed'))::NUMERIC
                            / NULLIF(COUNT(*),0) * 100, 1),
    'conversions',        COUNT(*) FILTER (WHERE outcome IN ('appointment_scheduled','transfer_completed','transferred','info_provided','information_provided')),
    'conversion_rate',    ROUND(
                            COUNT(*) FILTER (WHERE outcome IN ('appointment_scheduled','transfer_completed','transferred','info_provided','information_provided'))::NUMERIC
                            / NULLIF(COUNT(*) FILTER (WHERE outcome IS NOT NULL
                                                        AND outcome NOT IN ('voicemail','no_answer','hangup','call_failed')), 0) * 100,
                            1),
    'avg_duration',       ROUND(AVG(duration_seconds), 0),
    'total_billed_cost',  ROUND(COALESCE(SUM(billed_cost), 0)::NUMERIC, 4),
    'avg_billed_cost',    ROUND(COALESCE(AVG(billed_cost), 0)::NUMERIC, 4),
    'quality_score_avg',  ROUND(AVG(quality_score) FILTER (WHERE is_voicemail = false)::NUMERIC, 2),
    'voicemail_count',    COUNT(*) FILTER (WHERE outcome = 'voicemail'),
    'no_answer_count',    COUNT(*) FILTER (WHERE outcome = 'no_answer')
  ) INTO v_previous FROM period_calls;

  RETURN jsonb_build_object('current_period', v_current, 'previous_period', v_previous);
END;
$function$;

-- -----------------------------------------------------------------------------
-- 4. get_call_volume_by_day (TABLE) — DROP + CREATE + GRANT (5 grantees)
--    Adds: decroche_calls bigint, quality_score_avg numeric
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_call_volume_by_day(p_start_date date, p_end_date date, p_deployment_id uuid, p_template_type text);

CREATE FUNCTION public.get_call_volume_by_day(
  p_start_date date,
  p_end_date date,
  p_deployment_id uuid DEFAULT NULL,
  p_template_type text DEFAULT NULL
) RETURNS TABLE(
  day date,
  total_calls bigint,
  answered_calls bigint,
  conversions bigint,
  decroche_calls bigint,
  outbound_calls bigint,
  inbound_calls bigint,
  avg_duration numeric,
  quality_score_avg numeric
)
LANGUAGE plpgsql STABLE AS $function$
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
      COUNT(*)                                                                AS total_calls,
      -- Décroché (canonical) — replaces is_answered (strict)
      COUNT(*) FILTER (WHERE c.outcome IS NOT NULL
                         AND c.outcome NOT IN ('voicemail','no_answer','hangup','call_failed')) AS answered_calls,
      -- Conversions: 5 canonical outcomes, flat list
      COUNT(*) FILTER (WHERE c.outcome IN ('appointment_scheduled','transfer_completed','transferred','info_provided','information_provided')) AS conversions,
      -- New: decroche_calls = same as answered_calls (canonical décroché count, exposed
      -- explicitly so consumers can compute conversion_rate = conversions / decroche_calls)
      COUNT(*) FILTER (WHERE c.outcome IS NOT NULL
                         AND c.outcome NOT IN ('voicemail','no_answer','hangup','call_failed')) AS decroche_calls,
      COUNT(*) FILTER (WHERE c.direction = 'outbound')                        AS outbound_calls,
      COUNT(*) FILTER (WHERE c.direction = 'inbound')                         AS inbound_calls,
      ROUND(AVG(c.duration_seconds), 0)                                       AS avg_duration,
      -- Quality (voicemails excluded per canonical SSOT)
      ROUND(AVG(ca.quality_score) FILTER (WHERE ca.is_voicemail = false)::NUMERIC, 2) AS quality_score_avg
    FROM calls c
    JOIN agent_deployments ad  ON ad.id = c.deployment_id
    JOIN agent_templates   at2 ON at2.id = ad.template_id
    LEFT JOIN call_analyses ca ON ca.call_id = c.id
    WHERE (v_is_admin OR c.org_id = ANY(v_org_ids))
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
    COALESCE(agg.decroche_calls, 0),
    COALESCE(agg.outbound_calls, 0),
    COALESCE(agg.inbound_calls, 0),
    COALESCE(agg.avg_duration, 0),
    agg.quality_score_avg
  FROM date_series ds
  LEFT JOIN agg ON agg.d = ds.d
  ORDER BY ds.d ASC;
END;
$function$;

-- Re-emit grants (DROP revokes them all)
GRANT EXECUTE ON FUNCTION public.get_call_volume_by_day(date, date, uuid, text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_call_volume_by_day(date, date, uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_call_volume_by_day(date, date, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_call_volume_by_day(date, date, uuid, text) TO postgres;
GRANT EXECUTE ON FUNCTION public.get_call_volume_by_day(date, date, uuid, text) TO service_role;

-- -----------------------------------------------------------------------------
-- 5. get_agent_cards_data (TABLE) — DROP + CREATE + GRANT (5 grantees)
--    Adds: quality_score_avg numeric. Switches to canonical filters + denominator.
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_agent_cards_data(p_start_date date, p_end_date date, p_template_type text);

CREATE FUNCTION public.get_agent_cards_data(
  p_start_date date DEFAULT (now() - '30 days'::interval)::date,
  p_end_date date DEFAULT now()::date,
  p_template_type text DEFAULT NULL
) RETURNS TABLE(
  deployment_id uuid,
  deployment_name text,
  slug text,
  deployment_status text,
  phone_number text,
  dipler_agent_id text,
  template_type text,
  template_display_name text,
  total_calls bigint,
  answered_calls bigint,
  conversions bigint,
  answer_rate numeric,
  conversion_rate numeric,
  avg_duration numeric,
  total_billed_cost numeric,
  avg_billed_cost numeric,
  quality_score_avg numeric,
  last_call_at timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql STABLE AS $function$
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
    COUNT(c.id)                                                              AS total_calls,
    -- Décroché (canonical, lenient) — replaces is_answered (strict)
    COUNT(c.id) FILTER (WHERE c.outcome IS NOT NULL
                          AND c.outcome NOT IN ('voicemail','no_answer','hangup','call_failed')) AS answered_calls,
    -- Conversions: 5 canonical outcomes, flat list
    COUNT(c.id) FILTER (WHERE c.outcome IN ('appointment_scheduled','transfer_completed','transferred','info_provided','information_provided')) AS conversions,
    -- answer_rate = décroché / total
    ROUND(
      COUNT(c.id) FILTER (WHERE c.outcome IS NOT NULL
                            AND c.outcome NOT IN ('voicemail','no_answer','hangup','call_failed'))::NUMERIC
      / NULLIF(COUNT(c.id), 0) * 100,
      1
    )                                                                        AS answer_rate,
    -- conversion_rate denominator = décroché count (per canonical SSOT)
    ROUND(
      COUNT(c.id) FILTER (WHERE c.outcome IN ('appointment_scheduled','transfer_completed','transferred','info_provided','information_provided'))::NUMERIC
      / NULLIF(COUNT(c.id) FILTER (WHERE c.outcome IS NOT NULL
                                     AND c.outcome NOT IN ('voicemail','no_answer','hangup','call_failed')), 0) * 100,
      1
    )                                                                        AS conversion_rate,
    ROUND(AVG(c.duration_seconds), 0)                                        AS avg_duration,
    ROUND(COALESCE(SUM(cc.billed_cost), 0)::NUMERIC, 4)                      AS total_billed_cost,
    ROUND(COALESCE(AVG(cc.billed_cost), 0)::NUMERIC, 4)                      AS avg_billed_cost,
    -- Quality (voicemails excluded per canonical SSOT) — new column
    ROUND(AVG(ca.quality_score) FILTER (WHERE ca.is_voicemail = false)::NUMERIC, 2) AS quality_score_avg,
    MAX(c.started_at)                                                        AS last_call_at,
    ad.created_at
  FROM agent_deployments ad
  JOIN agent_templates at2 ON at2.id = ad.template_id
  LEFT JOIN calls c ON (c.deployment_id = ad.id
                          AND c.started_at::DATE BETWEEN p_start_date AND p_end_date)
  LEFT JOIN call_costs cc ON cc.call_id = c.id
  LEFT JOIN call_analyses ca ON ca.call_id = c.id
  WHERE (v_is_admin OR ad.org_id = ANY(v_org_ids))
    AND (p_template_type IS NULL OR at2.type = p_template_type)
  GROUP BY ad.id, ad.name, ad.slug, ad.status, ad.phone_number, ad.dipler_agent_id,
           at2.type, at2.display_name, ad.created_at
  ORDER BY ad.name ASC;
END;
$function$;

-- Re-emit grants (DROP revokes them all)
GRANT EXECUTE ON FUNCTION public.get_agent_cards_data(date, date, text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_agent_cards_data(date, date, text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_agent_cards_data(date, date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_agent_cards_data(date, date, text) TO postgres;
GRANT EXECUTE ON FUNCTION public.get_agent_cards_data(date, date, text) TO service_role;
