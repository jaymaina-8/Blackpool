-- 20260709000003_cms_capabilities.sql

-- Audit Logs
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null, -- e.g., 'CREATE', 'UPDATE', 'DELETE', 'RESTORE'
  entity_type text not null, -- e.g., 'article', 'category', 'media'
  entity_id uuid not null,
  previous_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.audit_logs enable row level security;
create policy "Admins can view audit logs" on public.audit_logs for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator'))
);
create policy "System can insert audit logs" on public.audit_logs for insert with check (true);

-- Article Revisions
create table public.article_revisions (
  id uuid default uuid_generate_v4() primary key,
  article_id uuid references public.articles(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null,
  title text,
  excerpt text,
  content jsonb,
  html_content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.article_revisions enable row level security;
create policy "Authors can view own revisions" on public.article_revisions for select using (
  auth.uid() = author_id or exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator', 'editor'))
);
create policy "Authors can insert revisions" on public.article_revisions for insert with check (
  auth.uid() = author_id or exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator', 'editor'))
);
