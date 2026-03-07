-- 012_movement_type_array.sql
-- Change movement_type from text to text[] to support multiple selection

ALTER TABLE wellness_videos
  ALTER COLUMN movement_type TYPE text[]
  USING CASE WHEN movement_type IS NULL THEN NULL ELSE ARRAY[movement_type] END;

ALTER TABLE wellness_articles
  ALTER COLUMN movement_type TYPE text[]
  USING CASE WHEN movement_type IS NULL THEN NULL ELSE ARRAY[movement_type] END;
