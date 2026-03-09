-- Corporate inquiry leads
CREATE TABLE IF NOT EXISTS corporate_inquiries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  name        text NOT NULL,
  email       text NOT NULL,
  company     text NOT NULL,
  team_size   text NOT NULL,
  plan        text,
  message     text,
  status      text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'qualified', 'closed_won', 'closed_lost'))
);

-- Admin only via service role; no public access
ALTER TABLE corporate_inquiries ENABLE ROW LEVEL SECURITY;
