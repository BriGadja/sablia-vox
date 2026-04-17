-- vox-admin-consumption: add billing metadata to organizations.
-- is_internal = Sablia internal orgs (excluded from client billing views by default).
-- billing_client_name = groups multiple orgs under one billing entity (e.g. VB groups Exotic + Stefano).
-- NULL falls back to organizations.name in UI.

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS is_internal BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS billing_client_name TEXT;

-- Mark Sablia internal (Charlie agent lives here).
UPDATE public.organizations
  SET is_internal = true
  WHERE id = '11111111-1111-1111-1111-111111111111';

-- Backfill billing groups from /architect decisions (locked, do not re-litigate).
UPDATE public.organizations SET billing_client_name = 'Norloc'
  WHERE id = '986c593d-30d7-4912-b41a-e2781c8b018a';

UPDATE public.organizations SET billing_client_name = 'VB'
  WHERE id IN (
    '855c1aa5-318c-41d4-b403-8113bc65d8fc',  -- Exotic Design
    '14e4f42a-6eca-4307-ac79-ea3dbb4751ff'   -- Stefano Design
  );

UPDATE public.organizations SET billing_client_name = 'Nestenn'
  WHERE id = 'f7341a5f-f075-41ef-bc4b-eb7e3e86427b';

COMMENT ON COLUMN public.organizations.is_internal IS 'True for Sablia internal orgs (excluded from client billing views).';
COMMENT ON COLUMN public.organizations.billing_client_name IS 'Groups multiple orgs under one billing entity. NULL falls back to organizations.name in UI.';
