-- Migration: impersonation_log table
-- Purpose: audit trail for admin impersonation of users (debug feature).
-- Gate: only users with app_metadata.is_admin = true can call the /api/admin/impersonate route;
--       the API writes one row per impersonation attempt via service_role.

CREATE TABLE IF NOT EXISTS public.impersonation_log (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_email            text NOT NULL,
  impersonated_user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  impersonated_email     text NOT NULL,
  created_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_impersonation_log_admin_user_id ON public.impersonation_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_log_impersonated_user_id ON public.impersonation_log(impersonated_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_log_created_at ON public.impersonation_log(created_at DESC);

ALTER TABLE public.impersonation_log ENABLE ROW LEVEL SECURITY;

-- Admins can read all rows (cross-org audit)
DROP POLICY IF EXISTS admin_read_impersonation_log ON public.impersonation_log;
CREATE POLICY admin_read_impersonation_log ON public.impersonation_log
  FOR SELECT TO authenticated USING (
    ((SELECT auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- No INSERT/UPDATE/DELETE policies for authenticated -- all writes via service_role
