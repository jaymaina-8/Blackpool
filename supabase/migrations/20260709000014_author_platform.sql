-- 20260709000014_author_platform.sql

-- 1. Extend profiles table
alter table public.profiles
  add column if not exists slug text unique,
  add column if not exists bio text,
  add column if not exists job_title text,
  add column if not exists company text,
  add column if not exists website text,
  add column if not exists linkedin text,
  add column if not exists github text,
  add column if not exists twitter text,
  add column if not exists featured boolean default false,
  add column if not exists seo_title text,
  add column if not exists seo_description text;

-- 2. Badges System
create table if not exists public.badges (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  icon text,
  color text default 'primary',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.profile_badges (
  profile_id uuid references public.profiles(id) on delete cascade,
  badge_id uuid references public.badges(id) on delete cascade,
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (profile_id, badge_id)
);

-- 3. Expertise System (Topical Authority)
create table if not exists public.expertise (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.profile_expertise (
  profile_id uuid references public.profiles(id) on delete cascade,
  expertise_id uuid references public.expertise(id) on delete cascade,
  primary key (profile_id, expertise_id)
);

-- 4. Multi-Author Support
create type article_author_role as enum ('primary', 'co-author', 'reviewer', 'editor');

create table if not exists public.article_authors (
  article_id uuid references public.articles(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  role article_author_role default 'primary'::article_author_role not null,
  primary key (article_id, author_id)
);

-- 5. Trust Indicators on Articles
alter table public.articles
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists fact_checked boolean default false,
  add column if not exists sources jsonb default '[]'::jsonb,
  add column if not exists estimated_reading_time integer,
  add column if not exists word_count integer;

-- RLS Policies
alter table public.badges enable row level security;
alter table public.profile_badges enable row level security;
alter table public.expertise enable row level security;
alter table public.profile_expertise enable row level security;
alter table public.article_authors enable row level security;

-- Public read access
create policy "Badges viewable by everyone" on public.badges for select using (true);
create policy "Profile badges viewable by everyone" on public.profile_badges for select using (true);
create policy "Expertise viewable by everyone" on public.expertise for select using (true);
create policy "Profile expertise viewable by everyone" on public.profile_expertise for select using (true);
create policy "Article authors viewable by everyone" on public.article_authors for select using (true);

-- Admin write access
create policy "Admins manage badges" on public.badges for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor'))
);
create policy "Admins manage profile_badges" on public.profile_badges for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor'))
);
create policy "Admins manage expertise" on public.expertise for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor'))
);
create policy "Admins manage profile_expertise" on public.profile_expertise for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor'))
);
create policy "Authors manage article_authors" on public.article_authors for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor', 'author'))
);
