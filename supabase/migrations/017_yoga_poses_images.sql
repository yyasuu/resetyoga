ALTER TABLE yoga_poses
  ADD COLUMN IF NOT EXISTS image_url_ja text,
  ADD COLUMN IF NOT EXISTS image_url_en text;
