-- 20260709000005_amendments.sql

-- 1. Fix User Creation Race Condition
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'viewer'::user_role -- Always default to viewer. Owner is assigned securely via dashboard/bootstrap.
  );
  return new;
end;
$$;

-- 2. Add Missing Foreign Key Indexes
create index if not exists idx_articles_category_id on public.articles(category_id);
create index if not exists idx_articles_author_id on public.articles(author_id);
create index if not exists idx_articles_cover_image_id on public.articles(cover_image_id);
create index if not exists idx_media_uploaded_by on public.media(uploaded_by);
create index if not exists idx_audit_logs_entity_id on public.audit_logs(entity_id);
create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);
create index if not exists idx_article_revisions_article_id on public.article_revisions(article_id);

-- 3. Composite Indexes for Common Query Patterns
create index if not exists idx_articles_status_published_at on public.articles(status, published_at desc);
create index if not exists idx_articles_category_status on public.articles(category_id, status);
create index if not exists idx_articles_author_status on public.articles(author_id, status);

-- 4. Document Content Columns
comment on column public.articles.content is 'Canonical source of article content, stored as structured JSON blocks (e.g. from BlockNote/Tiptap).';
comment on column public.articles.html_content is 'Generated HTML cache of the content blocks. Must never be edited directly; only updated programmatically when content changes.';

-- 5. Add SEO and Social Metadata Fields
alter table public.articles
  add column if not exists og_title text,
  add column if not exists og_description text,
  add column if not exists og_image text,
  add column if not exists twitter_title text,
  add column if not exists twitter_description text,
  add column if not exists twitter_image text;
