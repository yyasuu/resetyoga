-- =====================
-- Internationalize instructor_payout_info
-- =====================

-- Remove Japan-specific constraint on account_type
ALTER TABLE public.instructor_payout_info
  DROP CONSTRAINT IF EXISTS instructor_payout_info_account_type_check;

ALTER TABLE public.instructor_payout_info
  ALTER COLUMN account_type SET DEFAULT 'Savings';

-- Add international columns
ALTER TABLE public.instructor_payout_info
  ADD COLUMN IF NOT EXISTS bank_country text NOT NULL DEFAULT 'Japan',
  ADD COLUMN IF NOT EXISTS swift_code text,
  ADD COLUMN IF NOT EXISTS account_holder_name text;
