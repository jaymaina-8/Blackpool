-- 20260709000004_ai_tables.sql

-- Prompts
create table public.prompts (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  prompt_text text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.prompts enable row level security;

-- Generation Logs
create table public.generation_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  prompt_id uuid references public.prompts(id) on delete set null,
  input_data jsonb,
  generated_output text,
  tokens_used integer,
  duration_ms integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.generation_logs enable row level security;

-- AI Generations
create table public.ai_generations (
  id uuid default uuid_generate_v4() primary key,
  article_id uuid references public.articles(id) on delete cascade,
  generation_log_id uuid references public.generation_logs(id) on delete set null,
  block_id text, -- To track which block was generated
  status text not null default 'pending', -- pending, applied, rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.ai_generations enable row level security;

-- Content Clusters
create table public.content_clusters (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  target_keyword text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.content_clusters enable row level security;

-- Article Clusters mapping
create table public.article_clusters (
  article_id uuid references public.articles(id) on delete cascade,
  cluster_id uuid references public.content_clusters(id) on delete cascade,
  primary key (article_id, cluster_id)
);
alter table public.article_clusters enable row level security;

-- Keyword Research
create table public.keyword_research (
  id uuid default uuid_generate_v4() primary key,
  keyword text not null unique,
  search_volume integer,
  difficulty integer,
  intent text,
  analyzed_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.keyword_research enable row level security;

-- SEO Analysis
create table public.seo_analysis (
  id uuid default uuid_generate_v4() primary key,
  article_id uuid references public.articles(id) on delete cascade unique,
  seo_score integer not null,
  analysis_data jsonb not null, -- Store checks like { title_length: true, keyword_density: 1.2 }
  analyzed_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.seo_analysis enable row level security;

-- Add basic RLS policies for AI tables (Admins only)
create policy "Admins manage AI tables" on public.prompts for all using (exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator')));
create policy "Admins manage Generation Logs" on public.generation_logs for all using (exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator')));
create policy "Admins manage AI Generations" on public.ai_generations for all using (exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator')));
create policy "Admins manage Content Clusters" on public.content_clusters for all using (exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator')));
create policy "Admins manage Article Clusters" on public.article_clusters for all using (exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator')));
create policy "Admins manage Keyword Research" on public.keyword_research for all using (exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator')));
create policy "Admins manage SEO Analysis" on public.seo_analysis for all using (exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator')));
