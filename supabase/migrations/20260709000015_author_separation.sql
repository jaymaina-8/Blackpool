-- 20260709000015_author_separation.sql

-- 1. Create public.authors table (Decoupled from auth profiles)
create table if not exists public.authors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null, -- Optional link to auth user
  name text not null,
  slug text not null unique,
  avatar_url text,
  bio text,
  job_title text,
  company text,
  website text,
  linkedin text,
  github text,
  twitter text,
  featured boolean default false,
  seo_title text,
  seo_description text,
  verified boolean default false,
  verified_at timestamp with time zone,
  verified_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.authors enable row level security;
create policy "Authors viewable by everyone" on public.authors for select using (true);
create policy "Admins and Editors manage authors" on public.authors for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor'))
);

-- 2. Migrate data from profiles to authors (if any was populated)
insert into public.authors (user_id, name, slug, avatar_url, bio, job_title, company, website, linkedin, github, twitter, featured, seo_title, seo_description)
select 
  id as user_id,
  full_name as name,
  slug,
  avatar_url,
  bio,
  job_title,
  company,
  website,
  linkedin,
  github,
  twitter,
  featured,
  seo_title,
  seo_description
from public.profiles 
where slug is not null
on conflict (slug) do nothing;

-- 3. Drop author fields from profiles (Cleaning up migration 014)
alter table public.profiles
  drop column if exists slug cascade,
  drop column if exists bio cascade,
  drop column if exists job_title cascade,
  drop column if exists company cascade,
  drop column if exists website cascade,
  drop column if exists linkedin cascade,
  drop column if exists github cascade,
  drop column if exists twitter cascade,
  drop column if exists featured cascade,
  drop column if exists seo_title cascade,
  drop column if exists seo_description cascade;

-- 4. Update expertise and badges relationships
alter table public.profile_badges rename to author_badges;
alter table public.author_badges rename column profile_id to author_id;

-- Need to recreate the foreign key for author_badges
alter table public.author_badges drop constraint if exists profile_badges_profile_id_fkey;
alter table public.author_badges add constraint author_badges_author_id_fkey foreign key (author_id) references public.authors(id) on delete cascade;

alter table public.profile_expertise rename to author_expertise;
alter table public.author_expertise rename column profile_id to author_id;

-- Need to recreate the foreign key for author_expertise
alter table public.author_expertise drop constraint if exists profile_expertise_profile_id_fkey;
alter table public.author_expertise add constraint author_expertise_author_id_fkey foreign key (author_id) references public.authors(id) on delete cascade;

-- 5. Update articles relationships
-- Drop old foreign keys on articles
alter table public.articles drop constraint if exists articles_author_id_fkey;
alter table public.articles drop constraint if exists articles_reviewed_by_fkey;

-- We can't trivially map the existing profiles.id in articles.author_id to authors.id 
-- without an update statement if we want to maintain relational integrity.
-- Since this is early dev, we'll try to map it using the user_id link:
update public.articles a
set author_id = au.id
from public.authors au
where a.author_id = au.user_id;

update public.articles a
set reviewed_by = au.id
from public.authors au
where a.reviewed_by = au.user_id;

-- Now add the new constraints pointing to authors
alter table public.articles add constraint articles_author_id_fkey foreign key (author_id) references public.authors(id) on delete set null;
alter table public.articles add constraint articles_reviewed_by_fkey foreign key (reviewed_by) references public.authors(id) on delete set null;

-- 6. Update article_authors relationships
alter table public.article_authors drop constraint if exists article_authors_author_id_fkey;

update public.article_authors aa
set author_id = au.id
from public.authors au
where aa.author_id = au.user_id;

alter table public.article_authors add constraint article_authors_author_id_fkey foreign key (author_id) references public.authors(id) on delete cascade;

-- 7. Update RLS policies for renamed tables
drop policy if exists "Profile badges viewable by everyone" on public.author_badges;
drop policy if exists "Admins manage profile_badges" on public.author_badges;
create policy "Author badges viewable by everyone" on public.author_badges for select using (true);
create policy "Admins manage author_badges" on public.author_badges for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor'))
);

drop policy if exists "Profile expertise viewable by everyone" on public.author_expertise;
drop policy if exists "Admins manage profile_expertise" on public.author_expertise;
create policy "Author expertise viewable by everyone" on public.author_expertise for select using (true);
create policy "Admins manage author_expertise" on public.author_expertise for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor'))
);
