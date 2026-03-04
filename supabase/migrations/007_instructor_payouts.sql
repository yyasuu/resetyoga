-- ─────────────────────────────────────────────────────────────────────────────
-- 007_instructor_payouts.sql
-- Instructor payout tracking system
-- ─────────────────────────────────────────────────────────────────────────────

-- Add configurable default payout rate per instructor (admin can set this)
ALTER TABLE instructor_profiles
  ADD COLUMN IF NOT EXISTS payout_rate_usd numeric(10,2) DEFAULT NULL;

-- ─── Payout records ───────────────────────────────────────────────────────────
-- One record per payment batch (admin pays all pending sessions at once per instructor)
CREATE TABLE IF NOT EXISTS instructor_payouts (
  id                uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id     uuid          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_ids       uuid[]        NOT NULL DEFAULT '{}',
  session_count     int           NOT NULL DEFAULT 0,
  amount_usd        numeric(10,2) NOT NULL,
  payment_method    text          NOT NULL DEFAULT 'bank_transfer'
                                  CHECK (payment_method IN ('stripe', 'wise', 'bank_transfer', 'other')),
  payment_reference text,         -- transfer ID / transaction reference
  notes             text,
  paid_at           timestamptz   NOT NULL DEFAULT now(),
  paid_by           uuid          REFERENCES profiles(id),
  created_at        timestamptz   DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_instructor_payouts_instructor_id
  ON instructor_payouts(instructor_id);

CREATE INDEX IF NOT EXISTS idx_instructor_payouts_paid_at
  ON instructor_payouts(paid_at DESC);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE instructor_payouts ENABLE ROW LEVEL SECURITY;

-- Instructors can see their own payouts
CREATE POLICY "instructor_payouts_own_select"
  ON instructor_payouts FOR SELECT
  USING (instructor_id = auth.uid());

-- Admins have full access
CREATE POLICY "instructor_payouts_admin_all"
  ON instructor_payouts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
