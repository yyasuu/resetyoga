-- ============================================================
-- MIGRATION 005
-- 1. Fix UNIQUE(slot_id) on bookings → allow re-booking after cancel
-- 2. Add Storage RLS policies for avatars bucket
-- ============================================================

-- ── 1. Replace hard UNIQUE(slot_id) with partial unique index ──────────────
--
-- The original constraint blocks re-booking a slot that was previously
-- cancelled (the old booking row still exists with status='cancelled').
-- A partial index only enforces uniqueness for non-cancelled bookings.
--
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_slot_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_slot_id_active_unique
  ON public.bookings(slot_id)
  WHERE status != 'cancelled';

-- ── 2. Storage RLS policies for avatars bucket ─────────────────────────────
--
-- Without these policies, authenticated users cannot upload files even
-- to a public bucket, causing avatar uploads to fail silently.
--
CREATE POLICY "avatars_select_all" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
