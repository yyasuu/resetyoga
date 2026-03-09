CREATE TABLE yoga_poses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_sanskrit text NOT NULL,
  name_en text NOT NULL,
  name_ja text NOT NULL,
  image_url text,
  description_ja text,
  description_en text,
  how_to_ja text,       -- step by step, newline-separated steps
  how_to_en text,
  pose_family text,
  concerns text[] DEFAULT '{}',
  difficulty text DEFAULT 'beginner',  -- 'beginner' | 'intermediate' | 'advanced'
  variation_number int DEFAULT 1,
  access_level text DEFAULT 'public',  -- 'public' | 'member' | 'premium'
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE yoga_poses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published poses" ON yoga_poses FOR SELECT USING (is_published = true);

CREATE POLICY "Admin full access poses" ON yoga_poses USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
