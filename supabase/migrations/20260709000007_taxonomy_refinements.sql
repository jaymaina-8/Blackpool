-- 20260709000007_taxonomy_refinements.sql

-- Enable citext extension for case-insensitive unique tags
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;

-- Update categories to support hierarchy, SEO, ordering, and status
ALTER TABLE public.categories
ADD COLUMN parent_id uuid REFERENCES public.categories(id) ON DELETE RESTRICT,
ADD COLUMN seo_title text,
ADD COLUMN seo_description text,
ADD COLUMN display_order integer default 0,
ADD COLUMN status text default 'active' check (status in ('active', 'hidden'));

-- Enforce safe category deletion by restricting articles from being orphaned
ALTER TABLE public.articles
DROP CONSTRAINT articles_category_id_fkey,
ADD CONSTRAINT articles_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;

-- Update tags to use citext for strict case-insensitive uniqueness
ALTER TABLE public.tags
ALTER COLUMN name TYPE citext;
