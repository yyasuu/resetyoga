-- Run this in the Supabase SQL Editor

-- Wellness Videos (admin uploads, all members watch)
create table if not exists wellness_videos (
  id uuid primary key default gen_random_uuid(),
  title_ja text not null,
  title_en text not null,
  description_ja text,
  description_en text,
  video_url text not null,
  thumbnail_url text,
  duration_label text,
  category text not null default 'meditation',
  is_published boolean not null default false,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Wellness Articles (admin + instructors post, all members read)
create table if not exists wellness_articles (
  id uuid primary key default gen_random_uuid(),
  title_ja text not null,
  title_en text not null,
  content_ja text,
  content_en text,
  category text not null default 'ayurveda',
  cover_image_url text,
  is_published boolean not null default false,
  author_id uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table wellness_videos enable row level security;
alter table wellness_articles enable row level security;

-- Authenticated users can read published videos
create policy "authenticated read published videos"
  on wellness_videos for select
  using (auth.uid() is not null and is_published = true);

-- Authenticated users can read published articles
create policy "authenticated read published articles"
  on wellness_articles for select
  using (auth.uid() is not null and is_published = true);

-- Admins can read all videos (drafts too)
create policy "admin read all videos"
  on wellness_videos for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Admins can read all articles (drafts too)
create policy "admin read all articles"
  on wellness_articles for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Instructors can read their own articles (drafts too)
create policy "instructors read own articles"
  on wellness_articles for select
  using (author_id = auth.uid());

-- Admin manages all videos
create policy "admin manage videos"
  on wellness_videos for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Admin manages all articles
create policy "admin manage all articles"
  on wellness_articles for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Instructors manage their own articles
create policy "instructors manage own articles"
  on wellness_articles for all
  using (
    author_id = auth.uid() and
    exists (select 1 from profiles where id = auth.uid() and role in ('instructor', 'admin'))
  )
  with check (
    author_id = auth.uid() and
    exists (select 1 from profiles where id = auth.uid() and role in ('instructor', 'admin'))
  );
