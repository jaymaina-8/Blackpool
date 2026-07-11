-- 20260711000002_analytics_intelligence.sql

-- 1. Daily Metrics (Historical Snapshots for fast dashboard loading)
create table if not exists public.daily_metrics (
  id uuid default gen_random_uuid() primary key,
  date date not null unique,
  views integer default 0,
  visitors integer default 0,
  leads integer default 0,
  cta_clicks integer default 0,
  revenue numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Search Opportunities (0 results)
create table if not exists public.search_opportunities (
  id uuid default gen_random_uuid() primary key,
  query text not null,
  search_count integer default 1,
  last_searched_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Content Decay Logs
create table if not exists public.content_decay_logs (
  id uuid default gen_random_uuid() primary key,
  article_id text not null, -- references articles(id) but kept loose for simplicity
  status text not null, -- 'flagged', 'updated', 'ignored'
  previous_views integer not null,
  current_views integer not null,
  detected_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.daily_metrics enable row level security;
alter table public.search_opportunities enable row level security;
alter table public.content_decay_logs enable row level security;

-- Policies
create policy "Admins can view daily metrics"
  on public.daily_metrics for select
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('administrator', 'editor'))
  );

create policy "Anyone can insert search opportunities"
  on public.search_opportunities for insert
  with check (true);

create policy "Anyone can update search opportunities"
  on public.search_opportunities for update
  using (true);

create policy "Admins can view search opportunities"
  on public.search_opportunities for select
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('administrator', 'editor'))
  );

create policy "Admins can manage content decay logs"
  on public.content_decay_logs for all
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('administrator', 'editor'))
  );
