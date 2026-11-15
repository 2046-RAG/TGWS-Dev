-- ===========================================================================
-- 007_ticket_comments_rw.sql — T-060
-- Enable the ticket conversation and keep internal notes admin-only.
--
-- 001 gave ticket_comments a SELECT policy only, with no INSERT policy, so
-- nobody could reply. That SELECT policy also exposed is_internal notes to
-- the ticket owner. This migration replaces it with four explicit policies.
--
-- Idempotent: safe to re-run.
-- ===========================================================================

-- 001 policy plus three policies that were created manually in production
-- before this migration (verified 2026-11-15 via pg_policies). The customer
-- INSERT policy did NOT check user_id nor is_internal, so a customer could
-- have written an internal note or forged the author. Drop all of them.
DROP POLICY IF EXISTS "Users can view own ticket comments" ON ticket_comments;
DROP POLICY IF EXISTS "Users can insert comments for own tickets" ON ticket_comments;
DROP POLICY IF EXISTS "Admins can insert comments for any ticket" ON ticket_comments;
DROP POLICY IF EXISTS "Admins can view all ticket comments" ON ticket_comments;
DROP POLICY IF EXISTS "Customers see public comments on own tickets" ON ticket_comments;
DROP POLICY IF EXISTS "Admins see all ticket comments" ON ticket_comments;
DROP POLICY IF EXISTS "Customers insert public comments on own tickets" ON ticket_comments;
DROP POLICY IF EXISTS "Admins insert comments on any ticket" ON ticket_comments;

-- Customers only see non-internal replies on their own (non-deleted) tickets.
CREATE POLICY "Customers see public comments on own tickets" ON ticket_comments
  FOR SELECT USING (
    COALESCE(is_internal, FALSE) = FALSE
    AND EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_comments.ticket_id
        AND t.user_id = auth.uid()
        AND t.deleted_at IS NULL
    )
  );

CREATE POLICY "Admins see all ticket comments" ON ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin')
    )
  );

-- Customers may only add public replies to their own tickets.
CREATE POLICY "Customers insert public comments on own tickets" ON ticket_comments
  FOR INSERT WITH CHECK (
    COALESCE(is_internal, FALSE) = FALSE
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_id
        AND t.user_id = auth.uid()
        AND t.deleted_at IS NULL
    )
  );

-- Admins may add public or internal comments to any ticket. Internal notes
-- are additionally filtered out by the API for non-admin callers.
CREATE POLICY "Admins insert comments on any ticket" ON ticket_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin')
    )
  );
