-- 020_video_content_image.sql
-- Add optional content image field to wellness_videos (displayed below the video player)

ALTER TABLE wellness_videos
  ADD COLUMN IF NOT EXISTS content_image_url text;
