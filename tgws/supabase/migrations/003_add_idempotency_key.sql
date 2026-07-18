-- Migration 003: Add idempotency_key to tickets + INSERT RLS policies
-- Related: W1-3.1 (idempotency for ticket creation) and W1-3.3 (RLS for audit_log/attachments/comments)
--
-- IMPORTANT: This file is created but NOT executed. Run `supabase db push` manually
-- after reviewing the changes. Existing rows will have NULL idempotency_key which is
-- allowed under the UNIQUE constraint (NULL != NULL in Postgres).

-- 1. Add idempotency_key column with UNIQUE constraint
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_idempotency_key
  ON tickets (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Index to speed up idempotency lookups
-- (covered by the partial UNIQUE index above, no separate index needed)

-- 2. RLS INSERT policy: ticket_audit_log
--    Admins can insert any audit log entry.
--    Customers can insert audit log entries only for their own tickets
--    (e.g. the initial "created" entry written during ticket creation).
CREATE POLICY "Admins can insert audit log" ON ticket_audit_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can insert audit log for own tickets" ON ticket_audit_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_audit_log.ticket_id
      AND tickets.user_id = auth.uid()
      AND tickets.deleted_at IS NULL
    )
  );

-- 3. RLS INSERT policy: ticket_attachments
--    Users can insert attachments only for their own tickets.
--    Admins can insert attachments for any ticket.
CREATE POLICY "Admins can insert attachments for any ticket" ON ticket_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can insert attachments for own tickets" ON ticket_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_attachments.ticket_id
      AND tickets.user_id = auth.uid()
      AND tickets.deleted_at IS NULL
    )
  );

-- 4. RLS INSERT policy: ticket_comments
--    Users can insert comments only for their own tickets.
--    Admins can insert comments for any ticket.
CREATE POLICY "Admins can insert comments for any ticket" ON ticket_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can insert comments for own tickets" ON ticket_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_comments.ticket_id
      AND tickets.user_id = auth.uid()
      AND tickets.deleted_at IS NULL
    )
  );

-- 5. RLS SELECT policy: ticket_comments
--    Admins can view all comments. Customers can view comments on their own tickets.
--    (Existing policy only covers users; add admin policy for completeness.)
CREATE POLICY "Admins can view all ticket comments" ON ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND deleted_at IS NULL
    )
  );

-- 6. RLS SELECT policy: ticket_attachments
--    Admins can view all attachments.
CREATE POLICY "Admins can view all attachments" ON ticket_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND deleted_at IS NULL
    )
  );

-- 7. Admins can insert tickets on behalf of users (e.g. for support team)
CREATE POLICY "Admins can create tickets" ON tickets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND deleted_at IS NULL
    )
  );
