-- 011_wellness_metadata.sql
-- Add concerns[], movement_type, difficulty_level to wellness_videos
-- Add movement_type, difficulty_level to wellness_articles

ALTER TABLE wellness_videos
  ADD COLUMN IF NOT EXISTS concerns      text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS movement_type text,
  ADD COLUMN IF NOT EXISTS difficulty_level text;

ALTER TABLE wellness_articles
  ADD COLUMN IF NOT EXISTS movement_type text,
  ADD COLUMN IF NOT EXISTS difficulty_level text;
