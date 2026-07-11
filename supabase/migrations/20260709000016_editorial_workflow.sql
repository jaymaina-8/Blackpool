-- 20260709000016_editorial_workflow.sql

-- 1. Extend article_status enum
-- Postgres allows adding values to existing enums
alter type article_status add value if not exists 'in_review';
alter type article_status add value if not exists 'changes_requested';
alter type article_status add value if not exists 'approved';

-- 2. Article Versions
create table if not exists public.article_versions (
  id uuid default gen_random_uuid() primary key,
  article_id uuid references public.articles(id) on delete cascade,
  version integer not null,
  title text,
  excerpt text,
  content_json jsonb,
  html_content text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  change_summary text
);

-- Ensure version is unique per article
alter table public.article_versions add constraint article_versions_article_id_version_key unique (article_id, version);

-- 3. Editorial Comments
create table if not exists public.editorial_comments (
  id uuid default gen_random_uuid() primary key,
  article_id uuid references public.articles(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  block_reference text,
  resolved boolean default false,
  resolved_at timestamp with time zone,
  resolved_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Article Locks
create table if not exists public.article_locks (
  article_id uuid primary key references public.articles(id) on delete cascade,
  locked_by uuid references public.profiles(id) on delete cascade,
  locked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- 5. Workflow History
create table if not exists public.workflow_history (
  id uuid default gen_random_uuid() primary key,
  article_id uuid references public.articles(id) on delete cascade,
  previous_status article_status,
  new_status article_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Approval Steps
create table if not exists public.approval_steps (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  order_index integer not null,
  required_role text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default approval steps
insert into public.approval_steps (name, order_index, required_role) values
  ('SEO Review', 1, 'editor'),
  ('Editor Approval', 2, 'editor'),
  ('Publishing Queue', 3, 'administrator')
on conflict do nothing;

-- 7. Editorial Notifications
create table if not exists public.editorial_notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  article_id uuid references public.articles(id) on delete cascade,
  type text not null,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.article_versions enable row level security;
alter table public.editorial_comments enable row level security;
alter table public.article_locks enable row level security;
alter table public.workflow_history enable row level security;
alter table public.approval_steps enable row level security;
alter table public.editorial_notifications enable row level security;

-- Admin & Editor can see all workflow data
create policy "Admins and Editors can view article_versions" on public.article_versions for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor', 'author'))
);
create policy "Admins and Editors can manage article_versions" on public.article_versions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor', 'author'))
);

create policy "Authors and up can view editorial_comments" on public.editorial_comments for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor', 'author'))
);
create policy "Authors and up can manage editorial_comments" on public.editorial_comments for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor', 'author'))
);

create policy "Authors and up can view article_locks" on public.article_locks for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor', 'author'))
);
create policy "Authors and up can manage article_locks" on public.article_locks for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor', 'author'))
);

create policy "Authors and up can view workflow_history" on public.workflow_history for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor', 'author'))
);
create policy "Authors and up can insert workflow_history" on public.workflow_history for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor', 'author'))
);

create policy "Authors and up can view approval_steps" on public.approval_steps for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor', 'author'))
);

create policy "Users can view own notifications" on public.editorial_notifications for select using (
  auth.uid() = user_id
);
create policy "Users can update own notifications" on public.editorial_notifications for update using (
  auth.uid() = user_id
);
create policy "System can insert notifications" on public.editorial_notifications for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor', 'author'))
);
