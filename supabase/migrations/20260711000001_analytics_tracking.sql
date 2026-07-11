-- 20260711000001_analytics_tracking.sql

-- 1. Analytics Events (Traffic & Behavior)
create table if not exists public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  event_type text not null, -- 'page_view', 'scroll_depth', 'internal_click', 'external_click'
  session_id text not null,
  article_id text, -- nullable, for article-specific events
  path text not null,
  referrer text,
  source text, -- derived from referrer or UTM parameters
  device text, -- 'desktop', 'mobile', 'tablet'
  properties jsonb default '{}'::jsonb, -- e.g., { "scroll_percent": 75 }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Search Analytics
create table if not exists public.search_analytics (
  id uuid default gen_random_uuid() primary key,
  query text not null,
  results_count integer default 0,
  clicked_article_id text, -- nullable
  session_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Core Web Vitals
create table if not exists public.core_web_vitals (
  id uuid default gen_random_uuid() primary key,
  metric_name text not null, -- 'LCP', 'FCP', 'CLS', 'INP', 'TTFB'
  metric_value numeric not null,
  rating text not null, -- 'good', 'needs-improvement', 'poor'
  path text not null,
  session_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.analytics_events enable row level security;
alter table public.search_analytics enable row level security;
alter table public.core_web_vitals enable row level security;

-- Policies for analytics_events (Anonymous can insert, Admins can read)
create policy "Anyone can insert analytics events"
  on public.analytics_events for insert
  with check (true);

create policy "Admins can view analytics events"
  on public.analytics_events for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('administrator', 'editor')
    )
  );

-- Policies for search_analytics
create policy "Anyone can insert search analytics"
  on public.search_analytics for insert
  with check (true);

create policy "Admins can view search analytics"
  on public.search_analytics for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('administrator', 'editor')
    )
  );

-- Policies for core_web_vitals
create policy "Anyone can insert core web vitals"
  on public.core_web_vitals for insert
  with check (true);

create policy "Admins can view core web vitals"
  on public.core_web_vitals for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('administrator', 'editor')
    )
  );
