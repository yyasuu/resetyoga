-- 014_access_level.sql
-- Add 3-tier access_level to wellness content tables
-- Values: 'public' (anyone) | 'member' (free members) | 'premium' (paid subscribers)

-- wellness_videos
ALTER TABLE wellness_videos
  ADD COLUMN IF NOT EXISTS access_level text NOT NULL DEFAULT 'public'
  CHECK (access_level IN ('public', 'member', 'premium'));

-- wellness_articles: add column + migrate from is_premium
ALTER TABLE wellness_articles
  ADD COLUMN IF NOT EXISTS access_level text NOT NULL DEFAULT 'public'
  CHECK (access_level IN ('public', 'member', 'premium'));

-- Migrate existing article data
UPDATE wellness_articles
SET access_level = CASE
  WHEN is_premium = true THEN 'premium'
  ELSE 'public'
END;
