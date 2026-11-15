-- ===========================================================================
-- 006_add_user_sync.sql — T-057
-- Keep public.users in sync with auth.users.
--
-- Why: 001 declares tickets.user_id / ticket_comments.user_id /
-- ticket_audit_log.performed_by as FK -> users(id), but nothing ever inserted
-- a row into public.users. A freshly registered account therefore could not
-- create a ticket (FK violation).
--
-- Numbering note: TODO originally called this 004. 004 is skipped and 005 is
-- already used by T-061, so 006 is the next free id.
--
-- Idempotent: safe to run even if a trigger was created manually earlier.
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- public.users.email is NOT NULL UNIQUE. Accounts without an email
  -- (phone-only, or OAuth providers that withhold it) are skipped; they
  -- need a separate identity mapping before they can open tickets.
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'customer')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- SECURITY DEFINER is required: users only has SELECT/UPDATE policies, so a
-- normal authenticated session cannot INSERT its own profile row.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill accounts that registered before the trigger existed.
INSERT INTO public.users (id, email, role)
SELECT au.id, au.email, 'customer'
FROM auth.users AS au
WHERE au.email IS NOT NULL AND au.email <> ''
ON CONFLICT DO NOTHING;
