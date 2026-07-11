-- 20260709000009_search_discovery.sql

-- 1. Add featured and view tracking columns
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 2. Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_article_view_count(article_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.articles 
  SET view_count = view_count + 1 
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create function to search published articles across multiple relations
CREATE OR REPLACE FUNCTION public.search_published_articles(search_query text)
RETURNS SETOF public.articles AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT a.*
  FROM public.articles a
  LEFT JOIN public.categories c ON a.category_id = c.id
  LEFT JOIN public.article_tags at ON a.id = at.article_id
  LEFT JOIN public.tags t ON at.tag_id = t.id
  WHERE a.status = 'published'
    AND a.deleted_at IS NULL
    AND (
      a.title ILIKE '%' || search_query || '%'
      OR a.excerpt ILIKE '%' || search_query || '%'
      OR c.name ILIKE '%' || search_query || '%'
      OR t.name ILIKE '%' || search_query || '%'
    )
  ORDER BY a.published_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the new RPCs
GRANT EXECUTE ON FUNCTION public.increment_article_view_count(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_published_articles(text) TO anon, authenticated;
