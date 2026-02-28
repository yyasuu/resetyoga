-- =====================
-- Extend instructor_profiles
-- =====================
ALTER TABLE public.instructor_profiles
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS certifications text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS career_history text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS youtube_url text;

-- =====================
-- Avatar storage bucket
-- =====================
INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_user_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_user_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================
-- Instructor payout info
-- =====================
CREATE TABLE IF NOT EXISTS public.instructor_payout_info (
  id               uuid PRIMARY KEY REFERENCES public.instructor_profiles(id) ON DELETE CASCADE,
  bank_name        text,
  bank_branch      text,
  account_type     text NOT NULL DEFAULT '普通' CHECK (account_type IN ('普通', '当座')),
  account_number   text,
  account_holder_kana text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.instructor_payout_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payout_own_select" ON public.instructor_payout_info
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "payout_own_insert" ON public.instructor_payout_info
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "payout_own_update" ON public.instructor_payout_info
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "payout_admin" ON public.instructor_payout_info
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
