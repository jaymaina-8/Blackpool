-- 20260709000011_homepage_enhancements.sql

-- Add bio and job title to profiles
alter table public.profiles
  add column if not exists bio text,
  add column if not exists job_title text;

-- Add visibility and pinned_until to articles
create type article_visibility as enum ('public', 'homepage_only', 'blog_only');

alter table public.articles
  add column if not exists visibility article_visibility default 'public'::article_visibility not null,
  add column if not exists pinned_until timestamp with time zone;

-- Re-create the index on published_at to include visibility
create index if not exists idx_articles_status_visibility_published_at on public.articles(status, visibility, published_at desc);
