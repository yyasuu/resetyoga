ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_zoom numeric(3,2) NOT NULL DEFAULT 1.0;

