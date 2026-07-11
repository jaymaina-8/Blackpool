-- 20260709000002_core_tables.sql

-- Categories
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.profiles(id) on delete set null
);
alter table public.categories enable row level security;
create policy "Categories are viewable by everyone" on public.categories for select using (true);
create policy "Editors and Admins can insert categories" on public.categories for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator', 'editor'))
);
create policy "Editors and Admins can update categories" on public.categories for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator', 'editor'))
);
create policy "Editors and Admins can delete categories" on public.categories for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator', 'editor'))
);

-- Tags
create table public.tags (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.profiles(id) on delete set null
);
alter table public.tags enable row level security;
create policy "Tags are viewable by everyone" on public.tags for select using (true);
create policy "Editors and Admins can manage tags" on public.tags for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator', 'editor'))
);

-- Media Metadata
create table public.media (
  id uuid default uuid_generate_v4() primary key,
  filename text not null,
  storage_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null,
  width integer,
  height integer,
  alt_text text,
  caption text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamp with time zone
);
alter table public.media enable row level security;
create policy "Media viewable by everyone" on public.media for select using (deleted_at is null);
create policy "Authors and up can manage media" on public.media for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator', 'editor', 'author'))
);

-- Articles
create type article_status as enum ('draft', 'scheduled', 'published', 'archived', 'deleted');

create table public.articles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content jsonb, -- Storing block editor JSON
  html_content text, -- Rendered HTML for easy querying/SEO
  cover_image_id uuid references public.media(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  status article_status default 'draft'::article_status not null,
  seo_title text,
  seo_description text,
  canonical_url text,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);
alter table public.articles enable row level security;
create policy "Published articles viewable by everyone" on public.articles for select using (status = 'published' and deleted_at is null);
create policy "Authors can view own drafts" on public.articles for select using (
  auth.uid() = author_id or exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator', 'editor'))
);
create policy "Authors can insert own articles" on public.articles for insert with check (
  auth.uid() = author_id and exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator', 'editor', 'author'))
);
create policy "Authors can update own articles" on public.articles for update using (
  auth.uid() = author_id or exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator', 'editor'))
);
create policy "Authors can soft delete own articles" on public.articles for delete using (
  auth.uid() = author_id or exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator', 'editor'))
);

-- Article Tags
create table public.article_tags (
  article_id uuid references public.articles(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);
alter table public.article_tags enable row level security;
create policy "Article tags viewable by everyone" on public.article_tags for select using (true);
create policy "Authors can manage article tags" on public.article_tags for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator', 'editor', 'author'))
);

-- Settings
create table public.settings (
  id integer primary key default 1 check (id = 1), -- Single row table
  site_name text not null default 'Blackpool Industry',
  blog_name text not null default 'Blog',
  posts_per_page integer not null default 10,
  homepage_featured_posts integer not null default 3,
  contact_email text,
  analytics_id text,
  logo_url text,
  favicon_url text,
  default_og_image text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references public.profiles(id) on delete set null
);
insert into public.settings (site_name) values ('Blackpool Industry');
alter table public.settings enable row level security;
create policy "Settings viewable by everyone" on public.settings for select using (true);
create policy "Admins can update settings" on public.settings for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator'))
);
