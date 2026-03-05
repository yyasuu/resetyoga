-- Add IFSC code field for Indian bank accounts
ALTER TABLE instructor_payout_info
  ADD COLUMN IF NOT EXISTS ifsc_code text;
