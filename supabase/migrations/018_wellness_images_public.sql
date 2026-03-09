-- Make wellness-images bucket public so all users (including guests) can view images
UPDATE storage.buckets
  SET public = true
  WHERE id = 'wellness-images';

-- Public read policy for all objects in the bucket
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
