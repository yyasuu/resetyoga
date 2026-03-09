-- Ensure wellness-images bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wellness-images',
  'wellness-images',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure wellness-videos bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'wellness-videos',
  'wellness-videos',
  true,
  524288000
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read policy for wellness-images (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'wellness_images_public_read'
  ) THEN
    CREATE POLICY "wellness_images_public_read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'wellness-images');
  END IF;
END $$;

-- Public read policy for wellness-videos (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'wellness_videos_public_read'
  ) THEN
    CREATE POLICY "wellness_videos_public_read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'wellness-videos');
  END IF;
END $$;
