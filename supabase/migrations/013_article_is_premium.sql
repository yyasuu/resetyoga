-- Add is_premium flag to wellness_articles
ALTER TABLE wellness_articles
  ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false;
