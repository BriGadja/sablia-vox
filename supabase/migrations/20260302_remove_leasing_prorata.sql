-- Migration: Remove leasing prorata from invoice summary
-- Date: 2026-03-02
-- Description: Leasing column now shows raw DB values (agent_deployments.leasing)
--   instead of prorating the first month of deployment.
--   Example: Nestenn Alexandra deployed Feb 19 → was 407,14€, now shows 600€ (2×300€).

DROP FUNCTION IF EXISTS get_monthly_invoice_summary(INT, INT);

CREATE OR REPLACE FUNCTION get_monthly_invoice_summary(
  p_year INT,
  p_month INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_month_start DATE;
  v_month_end DATE;
  v_days_in_month INT;
  v_month_label TEXT;
BEGIN
  -- SÉCURITÉ: Vérifier que l'utilisateur est admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin permission required for invoice summary'
      USING ERRCODE = 'P0001';
  END IF;

  -- Calculer les dates du mois
  v_month_start := make_date(p_year, p_month, 1);
  v_month_end := (v_month_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  v_days_in_month := EXTRACT(DAY FROM v_month_end)::INT;

  -- Label du mois en français
  v_month_label := TO_CHAR(v_month_start, 'TMMonth YYYY');

  -- Construire le résultat
  WITH deployment_data AS (
    -- Récupérer tous les déploiements actifs avec leur leasing
    SELECT
      ad.id AS deployment_id,
      ad.name AS deployment_name,
      ad.client_id,
      c.name AS client_name,
      at.name AS agent_type,
      ad.leasing,
      ad.cost_per_min,
      ad.cost_per_sms,
      ad.cost_per_email,
      ad.deployed_at,
      ad.status,
      -- Leasing brut (pas de prorata)
      COALESCE(ad.leasing, 0) AS leasing_amount
    FROM agent_deployments ad
    JOIN clients c ON ad.client_id = c.id
    JOIN agent_types at ON ad.agent_type_id = at.id
    WHERE ad.status = 'active'
      AND c.name != 'Voipia'  -- Exclure le compte test
      AND ad.deployed_at <= v_month_end  -- Déployé avant ou pendant le mois
  ),

  call_consumption AS (
    -- Consommation appels par déploiement
    SELECT
      ac.deployment_id,
      COUNT(*) AS call_count,
      COALESCE(SUM(ac.duration_seconds), 0) AS total_seconds,
      ROUND(COALESCE(SUM(ac.duration_seconds), 0)::NUMERIC / 60.0, 2) AS total_minutes,
      ROUND(COALESCE(SUM(
        CASE
          WHEN ac.billed_cost IS NOT NULL THEN ac.billed_cost
          ELSE (COALESCE(ac.duration_seconds, 0)::NUMERIC / 60.0) * dd.cost_per_min
        END
      ), 0), 2) AS call_revenue
    FROM agent_calls ac
    JOIN deployment_data dd ON ac.deployment_id = dd.deployment_id
    WHERE ac.started_at >= v_month_start
      AND ac.started_at < v_month_start + INTERVAL '1 month'
      AND ac.duration_seconds > 0
    GROUP BY ac.deployment_id
  ),

  sms_consumption AS (
    -- Consommation SMS par déploiement
    SELECT
      s.deployment_id,
      COUNT(*) AS sms_count,
      ROUND(COALESCE(SUM(s.billed_cost), 0), 2) AS sms_revenue
    FROM agent_sms s
    JOIN deployment_data dd ON s.deployment_id = dd.deployment_id
    WHERE s.sent_at >= v_month_start
      AND s.sent_at < v_month_start + INTERVAL '1 month'
    GROUP BY s.deployment_id
  ),

  email_consumption AS (
    -- Consommation emails par déploiement
    SELECT
      e.deployment_id,
      COUNT(*) AS email_count,
      ROUND(COALESCE(SUM(e.billed_cost), 0), 2) AS email_revenue
    FROM agent_emails e
    JOIN deployment_data dd ON e.deployment_id = dd.deployment_id
    WHERE e.sent_at >= v_month_start
      AND e.sent_at < v_month_start + INTERVAL '1 month'
    GROUP BY e.deployment_id
  ),

  deployment_totals AS (
    -- Assembler toutes les données par déploiement
    SELECT
      dd.deployment_id,
      dd.deployment_name,
      dd.client_id,
      dd.client_name,
      dd.agent_type,
      dd.leasing,
      dd.leasing_amount,
      dd.cost_per_min,
      dd.cost_per_sms,
      dd.cost_per_email,
      dd.deployed_at,
      COALESCE(cc.call_count, 0) AS call_count,
      COALESCE(cc.total_minutes, 0) AS total_minutes,
      COALESCE(cc.call_revenue, 0) AS call_revenue,
      COALESCE(sc.sms_count, 0) AS sms_count,
      COALESCE(sc.sms_revenue, 0) AS sms_revenue,
      COALESCE(ec.email_count, 0) AS email_count,
      COALESCE(ec.email_revenue, 0) AS email_revenue,
      -- Totaux
      dd.leasing_amount AS deployment_leasing,
      COALESCE(cc.call_revenue, 0) + COALESCE(sc.sms_revenue, 0) + COALESCE(ec.email_revenue, 0) AS deployment_consumption,
      dd.leasing_amount + COALESCE(cc.call_revenue, 0) + COALESCE(sc.sms_revenue, 0) + COALESCE(ec.email_revenue, 0) AS deployment_total
    FROM deployment_data dd
    LEFT JOIN call_consumption cc ON dd.deployment_id = cc.deployment_id
    LEFT JOIN sms_consumption sc ON dd.deployment_id = sc.deployment_id
    LEFT JOIN email_consumption ec ON dd.deployment_id = ec.deployment_id
  ),

  client_totals AS (
    -- Agréger par client
    SELECT
      client_id,
      client_name,
      ROUND(SUM(deployment_leasing), 2) AS total_leasing,
      ROUND(SUM(deployment_consumption), 2) AS total_consumption,
      ROUND(SUM(deployment_total), 2) AS total_client,
      -- Détail des déploiements (JSON array)
      jsonb_agg(
        jsonb_build_object(
          'deployment_id', deployment_id,
          'deployment_name', deployment_name,
          'agent_type', agent_type,
          'deployed_at', deployed_at::DATE,
          'lines', (
            SELECT jsonb_agg(line ORDER BY line_order)
            FROM (
              -- Ligne Leasing
              SELECT
                1 AS line_order,
                jsonb_build_object(
                  'type', 'leasing',
                  'description', 'Abonnement ' || dt.agent_type,
                  'quantity', 1,
                  'unit', 'mois',
                  'unit_price', dt.leasing,
                  'amount', dt.leasing_amount
                ) AS line
              -- Ligne Appels (si > 0)
              UNION ALL
              SELECT
                2 AS line_order,
                jsonb_build_object(
                  'type', 'calls',
                  'description', 'Consommation appels',
                  'quantity', dt.total_minutes,
                  'unit', 'min',
                  'unit_price', dt.cost_per_min,
                  'amount', dt.call_revenue
                ) AS line
              WHERE dt.call_count > 0
              -- Ligne SMS (si > 0)
              UNION ALL
              SELECT
                3 AS line_order,
                jsonb_build_object(
                  'type', 'sms',
                  'description', 'SMS envoyés',
                  'quantity', dt.sms_count,
                  'unit', 'SMS',
                  'unit_price', dt.cost_per_sms,
                  'amount', dt.sms_revenue
                ) AS line
              WHERE dt.sms_count > 0
              -- Ligne Emails (si > 0)
              UNION ALL
              SELECT
                4 AS line_order,
                jsonb_build_object(
                  'type', 'emails',
                  'description', 'Emails envoyés',
                  'quantity', dt.email_count,
                  'unit', 'email',
                  'unit_price', dt.cost_per_email,
                  'amount', dt.email_revenue
                ) AS line
              WHERE dt.email_count > 0
            ) lines
          ),
          'subtotal', deployment_total
        )
        ORDER BY deployment_name
      ) AS deployments
    FROM deployment_totals dt
    GROUP BY client_id, client_name
  )

  -- Construire le JSON final
  SELECT jsonb_build_object(
    'period', jsonb_build_object(
      'year', p_year,
      'month', p_month,
      'label', v_month_label,
      'start_date', v_month_start,
      'end_date', v_month_end,
      'days_in_month', v_days_in_month
    ),
    'summary', jsonb_build_object(
      'total_leasing', COALESCE((SELECT ROUND(SUM(total_leasing), 2) FROM client_totals), 0),
      'total_consumption', COALESCE((SELECT ROUND(SUM(total_consumption), 2) FROM client_totals), 0),
      'total_invoice', COALESCE((SELECT ROUND(SUM(total_client), 2) FROM client_totals), 0),
      'total_clients', (SELECT COUNT(*) FROM client_totals)
    ),
    'clients', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'client_id', client_id,
          'client_name', client_name,
          'deployments', deployments,
          'total_leasing', total_leasing,
          'total_consumption', total_consumption,
          'total_client', total_client
        )
        ORDER BY total_client DESC
      )
      FROM client_totals),
      '[]'::jsonb
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION get_monthly_invoice_summary(INT, INT) TO authenticated;
