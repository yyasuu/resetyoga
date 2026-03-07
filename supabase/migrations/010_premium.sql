-- ============================================================
-- 010_premium.sql  Reset Yoga Premium plan schema
-- ============================================================

-- ── 1. Instructor tiers ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS premium_tiers (
  id             text    PRIMARY KEY,
  name_ja        text    NOT NULL,
  name_en        text    NOT NULL,
  price_min_jpy  integer NOT NULL,
  price_max_jpy  integer NOT NULL,
  sort_order     integer DEFAULT 0
);

INSERT INTO premium_tiers (id, name_ja, name_en, price_min_jpy, price_max_jpy, sort_order) VALUES
  ('tier1', '一般Premium講師',    'General Premium',       2500,  4500, 1),
  ('tier2', '認定・高評価講師',   'Certified / Top Rated', 4500,  8000, 2),
  ('tier3', '有名講師・希少テーマ','Featured / Rare',        8000, 20000, 3),
  ('tier4', '1on1・少人数特別',   'Private / Semi-Private',15000, 50000, 4)
ON CONFLICT (id) DO NOTHING;

-- ── 2. Instructor categories ────────────────────────────────
CREATE TABLE IF NOT EXISTS premium_instructor_categories (
  id              text PRIMARY KEY,
  name_ja         text NOT NULL,
  name_en         text NOT NULL,
  description_ja  text,
  description_en  text,
  sort_order      integer DEFAULT 0
);

INSERT INTO premium_instructor_categories
  (id, name_ja, name_en, description_ja, description_en, sort_order) VALUES
  ('celebrity','セレブリティ・インフルエンサー','Celebrity / Influencer',
   'フォロワーや知名度の高い講師','High-profile instructors with large followings',1),
  ('elite','エリートヨギ・マスター','Elite Yogi / Master Teacher',
   '深い専門性と実績を持つ上級講師','Advanced instructors with deep expertise and credentials',2),
  ('desk','デスクワーカー回復専門','Desk Recovery Specialist',
   'デスクワークによる肩・首・腰の不調を専門に解決','Specialists in reversing desk-related tension and pain',3),
  ('sleep','睡眠・神経系スペシャリスト','Sleep & Nervous System Specialist',
   '自律神経・睡眠の質改善に特化','Experts in sleep quality and autonomic nervous system',4),
  ('womens','女性のバランス・育児サポート','Women''s Balance / Motherhood',
   '女性特有の不調・産前産後・ホルモンバランスに対応','Women''s wellness, prenatal/postnatal, and hormonal balance',5),
  ('beginner','ビギナーに優しいガイド','Gentle Beginner Guide',
   '初心者が安心して始められる丁寧な指導','Patient, welcoming guides perfect for first-timers',6),
  ('athletic','アスリート向けモビリティ','Athletic Mobility / Strength Flow',
   '筋力・可動域・パフォーマンス向上に特化','Strength, mobility and athletic performance focus',7),
  ('luxury','マインドフル・ラグジュアリー','Mindful Luxury / Retreat Style',
   'リトリートのような上質な体験','Premium retreat-quality mindful experiences',8),
  ('english','English Global Class','English Global Class',
   '英語で受講できるインターナショナルクラス','International classes fully in English',9),
  ('japanese','ジャパニーズ・カームクラス','Japanese Calm Class',
   '日本語で丁寧に、静けさを大切にしたクラス','Serene Japanese-language classes emphasizing calm',10)
ON CONFLICT (id) DO NOTHING;

-- ── 3. Extend instructor_profiles ──────────────────────────
ALTER TABLE instructor_profiles
  ADD COLUMN IF NOT EXISTS premium_tier       text,
  ADD COLUMN IF NOT EXISTS premium_categories text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS premium_status     text    DEFAULT 'not_applied';

-- ── 4. Premium tier applications ───────────────────────────
CREATE TABLE IF NOT EXISTS premium_tier_applications (
  id                uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id     uuid    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  proposed_tier     text    NOT NULL REFERENCES premium_tiers(id),
  categories        text[]  DEFAULT '{}',
  bio_premium_ja    text,
  bio_premium_en    text,
  specialties       text,
  proposal_reason   text,
  status            text    DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected')),
  approved_tier     text    REFERENCES premium_tiers(id),
  reviewed_by       uuid    REFERENCES auth.users(id),
  review_note       text,
  reviewed_at       timestamptz,
  created_at        timestamptz DEFAULT now()
);

-- ── 5. Premium classes ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS premium_classes (
  id                   uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id        uuid    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title_ja             text    NOT NULL,
  title_en             text,
  description_ja       text,
  description_en       text,
  what_you_get_ja      text,
  who_its_for_ja       text,
  cautions_ja          text,
  class_type           text    NOT NULL
                       CHECK (class_type IN ('live','course','oneonone','workshop')),
  theme                text    NOT NULL,
  difficulty           text    NOT NULL
                       CHECK (difficulty IN ('beginner','intermediate','advanced')),
  tier_id              text    NOT NULL REFERENCES premium_tiers(id),
  proposed_price_jpy   integer NOT NULL,
  approved_price_jpy   integer,
  price_proposal_reason text,
  duration_minutes     integer DEFAULT 45,
  max_participants     integer,
  language             text    DEFAULT 'ja',
  thumbnail_url        text,
  scheduled_at         timestamptz,
  is_published         boolean DEFAULT false,
  status               text    DEFAULT 'draft'
                       CHECK (status IN ('draft','pending','approved','rejected')),
  rejection_reason     text,
  approved_by          uuid    REFERENCES auth.users(id),
  approved_at          timestamptz,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

-- ── 6. Premium subscriptions ───────────────────────────────
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id                     uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id             uuid    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan                   text    NOT NULL CHECK (plan IN ('select','studio_pass')),
  status                 text    NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active','canceled','past_due','incomplete')),
  credits_monthly        integer DEFAULT 0,
  credits_remaining      integer DEFAULT 0,
  stripe_subscription_id text    UNIQUE,
  stripe_customer_id     text,
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

-- ── 7. Premium waitlist ────────────────────────────────────
CREATE TABLE IF NOT EXISTS premium_waitlist (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL UNIQUE,
  name       text,
  concern    text,
  locale     text DEFAULT 'ja',
  created_at timestamptz DEFAULT now()
);

-- ── 8. RLS ────────────────────────────────────────────────
ALTER TABLE premium_tiers                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_instructor_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_tier_applications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_classes                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_waitlist                ENABLE ROW LEVEL SECURITY;

-- Public read for reference tables
CREATE POLICY "public read premium_tiers"
  ON premium_tiers FOR SELECT USING (true);

CREATE POLICY "public read premium_instructor_categories"
  ON premium_instructor_categories FOR SELECT USING (true);

-- Premium classes: public can read approved+published; admin/instructor manage own
CREATE POLICY "public read approved premium_classes"
  ON premium_classes FOR SELECT
  USING (status = 'approved' AND is_published = true);

CREATE POLICY "admin all premium_classes"
  ON premium_classes FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "instructor own premium_classes"
  ON premium_classes FOR ALL
  USING (instructor_id = auth.uid());

-- Tier applications
CREATE POLICY "instructor own tier_applications"
  ON premium_tier_applications FOR ALL
  USING (instructor_id = auth.uid());

CREATE POLICY "admin all tier_applications"
  ON premium_tier_applications FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Subscriptions
CREATE POLICY "own premium_subscriptions"
  ON premium_subscriptions FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "admin all premium_subscriptions"
  ON premium_subscriptions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Waitlist: anyone can join, admin can read
CREATE POLICY "insert premium_waitlist"
  ON premium_waitlist FOR INSERT WITH CHECK (true);

CREATE POLICY "admin read premium_waitlist"
  ON premium_waitlist FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
