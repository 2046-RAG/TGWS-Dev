-- Migration: Add Global Search tables (leads, search_logs)
-- Created: 2026-01-25

-- 销售线索表
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

-- 搜索日志表
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_search_logs_created ON search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs(query);
CREATE INDEX IF NOT EXISTS idx_search_logs_user ON search_logs(user_id);

-- 启用RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "Users can view own leads" ON leads
  FOR SELECT USING (auth.uid() = user_id OR assigned_to = auth.uid());

CREATE POLICY "Users can create leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update leads" ON leads
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin'))
  );

-- Search logs policies
CREATE POLICY "Users can view own search logs" ON search_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create search logs" ON search_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all search logs" ON search_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin'))
  );

-- 创建updated_at触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();