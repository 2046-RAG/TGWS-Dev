-- Migration 005: Fix Global Search tables / RLS
-- Created: 2026-11-15
-- Why: 003_add_search_tables.sql contains an invalid policy:
--        CREATE POLICY "Users can view own leads" ON leads
--          FOR SELECT USING (auth.uid() = user_id OR assigned_to = auth.uid());
--      `leads` has no `user_id` column, so PostgreSQL raises
--      `column "user_id" does not exist` and the whole 003 script aborts.
--      Depending on how 003 was executed, search_logs / its policies / the
--      updated_at trigger may not exist at all.
--
-- This migration is idempotent and safe to re-run.
-- It creates whatever 003 intended, with the policy corrected.

-- ---------------------------------------------------------------------------
-- 1. Tables (no-op if 003 already created them)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  search_query TEXT NOT NULL,
  gap_description TEXT,
  source TEXT DEFAULT 'global_search',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
  assigned_to UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  query TEXT NOT NULL,
  query_type TEXT DEFAULT 'text' CHECK (query_type IN ('text', 'image')),
  filters JSONB,
  results_count INTEGER,
  internal_count INTEGER,
  external_count INTEGER,
  capability_gap_detected BOOLEAN DEFAULT FALSE,
  gap_description TEXT,
  lead_id UUID REFERENCES leads(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_search_logs_created ON search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs(query);
CREATE INDEX IF NOT EXISTS idx_search_logs_user ON search_logs(user_id);

-- ---------------------------------------------------------------------------
-- 3. RLS
-- ---------------------------------------------------------------------------

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- 3.1 leads: owners are identified by `assigned_to` (there is no submitter column).
--     Anonymous visitors submit leads through the server API; they do not read them back.
DROP POLICY IF EXISTS "Users can view own leads" ON leads;
CREATE POLICY "Users can view own leads" ON leads
  FOR SELECT USING (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Users can create leads" ON leads;
CREATE POLICY "Users can create leads" ON leads
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update leads" ON leads;
CREATE POLICY "Admins can update leads" ON leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin')
    )
  );

-- 3.2 search_logs: a user sees own rows, admins see all.
DROP POLICY IF EXISTS "Users can view own search logs" ON search_logs;
CREATE POLICY "Users can view own search logs" ON search_logs
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create search logs" ON search_logs;
CREATE POLICY "Users can create search logs" ON search_logs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all search logs" ON search_logs;
CREATE POLICY "Admins can view all search logs" ON search_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin')
    )
  );

-- ---------------------------------------------------------------------------
-- 4. updated_at trigger (DROP first: 003 did not guard against re-runs)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
