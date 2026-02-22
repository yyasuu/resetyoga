-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- =====================
-- PROFILES (all users)
-- =====================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null check (role in ('instructor', 'student', 'admin')) default 'student',
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================
-- INSTRUCTOR PROFILES
-- =====================
create table public.instructor_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  bio text,
  yoga_styles text[] not null default '{}',
  languages text[] not null default '{}',
  years_experience int not null default 0,
  is_approved boolean not null default false,
  rating numeric(3,2) not null default 0,
  total_reviews int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================
-- STUDENT SUBSCRIPTIONS
-- =====================
create table public.student_subscriptions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  stripe_subscription_id text,
  stripe_customer_id text,
  status text not null check (status in ('trial', 'active', 'past_due', 'canceled', 'incomplete')) default 'trial',
  trial_used int not null default 0,
  trial_limit int not null default 2,
  sessions_used int not null default 0,
  sessions_limit int not null default 4,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id)
);

-- =====================
-- TIME SLOTS (instructor availability - 45 min)
-- =====================
create table public.time_slots (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null check (status in ('available', 'booked', 'cancelled')) default 'available',
  created_at timestamptz not null default now(),
  constraint valid_duration check (
    extract(epoch from (end_time - start_time)) = 2700  -- 45 minutes
  ),
  constraint no_past_slots check (start_time > now() - interval '1 hour')
);

create index idx_time_slots_instructor_id on public.time_slots(instructor_id);
create index idx_time_slots_start_time on public.time_slots(start_time);
create index idx_time_slots_status on public.time_slots(status);

-- =====================
-- BOOKINGS
-- =====================
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  slot_id uuid not null references public.time_slots(id) on delete restrict,
  google_meet_link text,
  google_calendar_event_id text,
  status text not null check (status in ('confirmed', 'cancelled', 'completed')) default 'confirmed',
  is_trial boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(slot_id)  -- one booking per slot
);

create index idx_bookings_student_id on public.bookings(student_id);
create index idx_bookings_instructor_id on public.bookings(instructor_id);

-- =====================
-- REVIEWS
-- =====================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique(booking_id)
);

create index idx_reviews_instructor_id on public.reviews(instructor_id);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
alter table public.profiles enable row level security;
alter table public.instructor_profiles enable row level security;
alter table public.student_subscriptions enable row level security;
alter table public.time_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

-- Profiles: users can read all, edit own
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Instructor profiles: readable by all, editable by own instructor
create policy "instructor_profiles_select_all" on public.instructor_profiles for select using (true);
create policy "instructor_profiles_insert_own" on public.instructor_profiles for insert with check (auth.uid() = id);
create policy "instructor_profiles_update_own" on public.instructor_profiles for update using (auth.uid() = id);

-- Student subscriptions: own only
create policy "subscriptions_select_own" on public.student_subscriptions for select using (auth.uid() = student_id);
create policy "subscriptions_insert_own" on public.student_subscriptions for insert with check (auth.uid() = student_id);
create policy "subscriptions_update_own" on public.student_subscriptions for update using (auth.uid() = student_id);

-- Time slots: instructors manage own, everyone can read available
create policy "slots_select_all" on public.time_slots for select using (true);
create policy "slots_insert_own" on public.time_slots for insert with check (auth.uid() = instructor_id);
create policy "slots_update_own" on public.time_slots for update using (auth.uid() = instructor_id);
create policy "slots_delete_own" on public.time_slots for delete using (auth.uid() = instructor_id and status = 'available');

-- Bookings: student or instructor of the booking can read
create policy "bookings_select_participant" on public.bookings for select
  using (auth.uid() = student_id or auth.uid() = instructor_id);
create policy "bookings_insert_student" on public.bookings for insert with check (auth.uid() = student_id);
create policy "bookings_update_participant" on public.bookings for update
  using (auth.uid() = student_id or auth.uid() = instructor_id);

-- Reviews: readable by all, inserted by student
create policy "reviews_select_all" on public.reviews for select using (true);
create policy "reviews_insert_student" on public.reviews for insert with check (auth.uid() = student_id);

-- =====================
-- FUNCTIONS & TRIGGERS
-- =====================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();
create trigger instructor_profiles_updated_at before update on public.instructor_profiles
  for each row execute procedure public.handle_updated_at();
create trigger subscriptions_updated_at before update on public.student_subscriptions
  for each row execute procedure public.handle_updated_at();
create trigger bookings_updated_at before update on public.bookings
  for each row execute procedure public.handle_updated_at();

-- Update instructor rating when review added
create or replace function public.update_instructor_rating()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  update public.instructor_profiles
  set
    rating = (
      select round(avg(rating)::numeric, 2)
      from public.reviews
      where instructor_id = new.instructor_id
    ),
    total_reviews = (
      select count(*) from public.reviews where instructor_id = new.instructor_id
    )
  where id = new.instructor_id;
  return new;
end;
$$;

create trigger on_review_created
  after insert on public.reviews
  for each row execute procedure public.update_instructor_rating();
