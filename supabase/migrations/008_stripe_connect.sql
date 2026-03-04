-- ─────────────────────────────────────────────────────────────────────────────
-- 008_stripe_connect.sql
-- Add Stripe Connect fields to instructor payout info
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE instructor_payout_info
  ADD COLUMN IF NOT EXISTS stripe_account_id        text    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_complete boolean DEFAULT FALSE;
