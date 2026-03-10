-- 021_video_rich_content.sql
-- Add rich-text HTML content fields (Japanese + English) to wellness_videos
-- Displayed below the video player on the detail page (text + inline images, Word-like editing)

ALTER TABLE wellness_videos
  ADD COLUMN IF NOT EXISTS content_ja text,
  ADD COLUMN IF NOT EXISTS content_en text;
