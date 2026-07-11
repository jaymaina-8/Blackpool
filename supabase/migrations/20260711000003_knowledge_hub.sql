-- 20260711000003_knowledge_hub.sql

-- 1. Extend Articles with Pillar and Hierarchical properties
alter table public.articles add column if not exists is_pillar boolean default false;
alter table public.articles add column if not exists parent_article_id uuid references public.articles(id) on delete set null;

-- 2. Extend Categories to act as Topic Hubs without duplicating data
alter table public.categories add column if not exists hero_description text;
alter table public.categories add column if not exists icon text;
alter table public.categories add column if not exists seo_title text;
alter table public.categories add column if not exists seo_description text;

-- 3. Reading Paths (Curated Journeys)
create table if not exists public.reading_paths (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text not null unique,
    description text,
    seo_title text,
    seo_description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Reading Path Steps (Articles mapped to paths)
create table if not exists public.reading_path_steps (
    path_id uuid references public.reading_paths(id) on delete cascade,
    article_id uuid references public.articles(id) on delete cascade,
    step_order integer not null,
    primary key (path_id, article_id)
);

-- 5. Article Relationships (Smart Linking & Next/Prev Graph)
create table if not exists public.article_relationships (
    source_article_id uuid references public.articles(id) on delete cascade,
    target_article_id uuid references public.articles(id) on delete cascade,
    relationship_type text not null check (relationship_type in ('related', 'next', 'previous')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (source_article_id, target_article_id, relationship_type)
);

-- Enable RLS
alter table public.reading_paths enable row level security;
alter table public.reading_path_steps enable row level security;
alter table public.article_relationships enable row level security;

-- Policies for Reading Paths
create policy "Reading paths are viewable by everyone"
    on public.reading_paths for select
    using (true);

create policy "Admins can manage reading paths"
    on public.reading_paths for all
    using (
        exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('administrator', 'editor'))
    );

-- Policies for Reading Path Steps
create policy "Reading path steps are viewable by everyone"
    on public.reading_path_steps for select
    using (true);

create policy "Admins can manage reading path steps"
    on public.reading_path_steps for all
    using (
        exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('administrator', 'editor'))
    );

-- Policies for Article Relationships
create policy "Article relationships are viewable by everyone"
    on public.article_relationships for select
    using (true);

create policy "Admins can manage article relationships"
    on public.article_relationships for all
    using (
        exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('administrator', 'editor'))
    );
