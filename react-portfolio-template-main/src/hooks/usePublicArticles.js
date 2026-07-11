import { useCallback, useState } from 'react'
import { supabase } from '/src/utils/supabase.js'

export function usePublicArticles() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const mapCoverUrls = (articles) => {
        return articles.map(article => {
            let coverUrl = null
            if (article.cover) {
                const { data: urlData } = supabase.storage.from('media').getPublicUrl(article.cover.storage_path)
                coverUrl = urlData.publicUrl
            }
            return { ...article, coverUrl }
        })
    }

    const fetchPublishedArticles = useCallback(async ({ page = 1, limit = 12, sort = 'latest' } = {}) => {
        setIsLoading(true)
        setError(null)
        try {
            let query = supabase
                .from('articles')
                .select(`
                    id, title, slug, excerpt, published_at, updated_at, is_featured, view_count,
                    author:authors!articles_author_id_fkey(name, avatar_url),
                    category:categories!articles_category_id_fkey(name, slug),
                    cover:media!articles_cover_image_id_fkey(storage_path, alt_text, width, height)
                `, { count: 'exact' })
                .eq('status', 'published')
                .is('deleted_at', null)

            if (sort === 'featured') {
                query = query.eq('is_featured', true).order('published_at', { ascending: false })
            } else if (sort === 'popular') {
                query = query.order('view_count', { ascending: false }).order('published_at', { ascending: false })
            } else {
                query = query.order('published_at', { ascending: false })
            }

            const from = (page - 1) * limit
            const to = from + limit - 1
            query = query.range(from, to)

            const { data, error: apiError, count } = await query
            if (apiError) throw apiError

            return { articles: mapCoverUrls(data), count }
        } catch (err) {
            setError(err.message)
            return { articles: [], count: 0 }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const fetchArticlesByCategory = useCallback(async (categorySlug, { page = 1, limit = 12 } = {}) => {
        setIsLoading(true)
        setError(null)
        try {
            // First get the category ID
            const { data: catData, error: catError } = await supabase
                .from('categories')
                .select('id, name, description')
                .eq('slug', categorySlug)
                .single()
            
            if (catError) throw catError

            let query = supabase
                .from('articles')
                .select(`
                    id, title, slug, excerpt, published_at, updated_at, is_featured, view_count,
                    author:authors!articles_author_id_fkey(name, avatar_url),
                    category:categories!articles_category_id_fkey(name, slug),
                    cover:media!articles_cover_image_id_fkey(storage_path, alt_text, width, height)
                `, { count: 'exact' })
                .eq('status', 'published')
                .is('deleted_at', null)
                .eq('category_id', catData.id)
                .order('published_at', { ascending: false })

            const from = (page - 1) * limit
            const to = from + limit - 1
            query = query.range(from, to)

            const { data, error: apiError, count } = await query
            if (apiError) throw apiError

            return { category: catData, articles: mapCoverUrls(data), count }
        } catch (err) {
            setError(err.message)
            return { category: null, articles: [], count: 0 }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const fetchArticlesByTag = useCallback(async (tagSlug, { page = 1, limit = 12 } = {}) => {
        setIsLoading(true)
        setError(null)
        try {
            // First get the tag ID
            const { data: tagData, error: tagError } = await supabase
                .from('tags')
                .select('id, name')
                .eq('slug', tagSlug)
                .single()
            
            if (tagError) throw tagError

            let query = supabase
                .from('article_tags')
                .select(`
                    article:articles!inner(
                        id, title, slug, excerpt, published_at, updated_at, is_featured, view_count,
                        author:authors!articles_author_id_fkey(name, avatar_url),
                        category:categories!articles_category_id_fkey(name, slug),
                        cover:media!articles_cover_image_id_fkey(storage_path, alt_text, width, height)
                    )
                `, { count: 'exact' })
                .eq('tag_id', tagData.id)
                .eq('articles.status', 'published')
                .is('articles.deleted_at', null)

            // PostgREST ordering across joins is complex, we will handle basic pagination
            const from = (page - 1) * limit
            const to = from + limit - 1
            query = query.range(from, to)

            const { data, error: apiError, count } = await query
            if (apiError) throw apiError

            const mappedArticles = data.map(d => d.article)
            // Sort client-side for simplicity since they are from a join table, though pagination applies to the join.
            mappedArticles.sort((a,b) => new Date(b.published_at) - new Date(a.published_at))

            return { tag: tagData, articles: mapCoverUrls(mappedArticles), count }
        } catch (err) {
            setError(err.message)
            return { tag: null, articles: [], count: 0 }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const fetchArticleBySlug = useCallback(async (slug) => {
        setIsLoading(true)
        setError(null)
        try {
            const { data, error: apiError } = await supabase
                .from('articles')
                .select(`
                    *,
                    author:authors!articles_author_id_fkey(name, avatar_url, bio, slug),
                    reviewer:authors!articles_reviewed_by_fkey(name, slug),
                    category:categories!articles_category_id_fkey(id, name, slug),
                    cover:media!articles_cover_image_id_fkey(storage_path, alt_text, width, height),
                    article_tags( tags(id, name, slug) ),
                    article_authors(role, author:authors(name, slug))
                `)
                .eq('slug', slug)
                .eq('status', 'published')
                .is('deleted_at', null)
                .single()

            if (apiError) {
                if (apiError.code === 'PGRST116') {
                    const redirectSlug = await checkRedirect(slug)
                    if (redirectSlug) {
                        return { redirect: redirectSlug }
                    }
                }
                throw apiError
            }

            let coverUrl = null
            if (data.cover) {
                const { data: urlData } = supabase.storage.from('media').getPublicUrl(data.cover.storage_path)
                coverUrl = urlData.publicUrl
            }

            const tags = data.article_tags?.map(at => at.tags) || []

            return { ...data, coverUrl, tags }
        } catch (err) {
            console.error("Article not found or error:", err)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    const checkRedirect = async (oldSlug) => {
        try {
            const { data } = await supabase.from('redirects').select('new_slug').eq('old_slug', oldSlug).single()
            return data?.new_slug
        } catch (err) {
            return null
        }
    }

    const fetchRelatedArticles = useCallback(async (currentArticle, limit = 3) => {
        try {
            if (!currentArticle?.id) return []
            
            let categoryArticles = []
            if (currentArticle.category?.id) {
                const { data } = await supabase
                    .from('articles')
                    .select('id, title, slug, published_at, cover:media!articles_cover_image_id_fkey(storage_path)')
                    .eq('status', 'published')
                    .is('deleted_at', null)
                    .eq('category_id', currentArticle.category.id)
                    .neq('id', currentArticle.id)
                    .order('published_at', { ascending: false })
                    .limit(limit)
                categoryArticles = data || []
            }
            
            let tagArticles = []
            if (currentArticle.tags?.length > 0) {
                const tagIds = currentArticle.tags.map(t => t.id)
                const { data } = await supabase
                    .from('article_tags')
                    .select('article:articles!inner(id, title, slug, published_at, cover:media!articles_cover_image_id_fkey(storage_path))')
                    .in('tag_id', tagIds)
                    .eq('articles.status', 'published')
                    .is('articles.deleted_at', null)
                    .neq('articles.id', currentArticle.id)
                    .limit(limit * 2)
                    
                if (data) tagArticles = data.map(d => d.article)
            }
            
            const { data: latestArticles } = await supabase
                .from('articles')
                .select('id, title, slug, published_at, cover:media!articles_cover_image_id_fkey(storage_path)')
                .eq('status', 'published')
                .is('deleted_at', null)
                .neq('id', currentArticle.id)
                .order('published_at', { ascending: false })
                .limit(limit)

            const allArticles = [...tagArticles, ...categoryArticles, ...(latestArticles || [])]
            const uniqueMap = new Map()
            
            allArticles.forEach(a => {
                if (a && !uniqueMap.has(a.id)) {
                    uniqueMap.set(a.id, a)
                }
            })
            
            const results = Array.from(uniqueMap.values()).slice(0, limit)
            return mapCoverUrls(results)
        } catch (err) {
            console.error("Failed to fetch related articles:", err)
            return []
        }
    }, [])

    const incrementViewCount = useCallback(async (articleId) => {
        try {
            await supabase.rpc('increment_article_view_count', { article_id: articleId })
        } catch (err) {
            console.error("Failed to increment view count", err)
        }
    }, [])

    const fetchAdjacentArticles = useCallback(async (currentDate) => {
        try {
            const [prevRes, nextRes] = await Promise.all([
                supabase.from('articles')
                    .select('title, slug')
                    .eq('status', 'published')
                    .is('deleted_at', null)
                    .lt('published_at', currentDate)
                    .order('published_at', { ascending: false })
                    .limit(1)
                    .single(),
                supabase.from('articles')
                    .select('title, slug')
                    .eq('status', 'published')
                    .is('deleted_at', null)
                    .gt('published_at', currentDate)
                    .order('published_at', { ascending: true })
                    .limit(1)
                    .single()
            ])
            return {
                prev: prevRes.data || null,
                next: nextRes.data || null
            }
        } catch (err) {
            return { prev: null, next: null }
        }
    }, [])

    const fetchFeaturedArticles = useCallback((limit = 1) => fetchPublishedArticles({ sort: 'featured', limit }), [fetchPublishedArticles])
    const fetchLatestArticles = useCallback((limit = 6) => fetchPublishedArticles({ sort: 'latest', limit }), [fetchPublishedArticles])
    const fetchPopularArticles = useCallback((limit = 3) => fetchPublishedArticles({ sort: 'popular', limit }), [fetchPublishedArticles])

    const fetchCategories = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name, slug, articles(id, status, deleted_at)')
                .order('name')
            if (error) throw error
            
            // Map and filter articles to get accurate published count
            const categoriesWithCounts = (data || []).map(cat => {
                const publishedCount = cat.articles?.filter(a => a.status === 'published' && !a.deleted_at).length || 0
                return {
                    id: cat.id,
                    name: cat.name,
                    slug: cat.slug,
                    count: publishedCount
                }
            })
            // Return only categories with at least 1 published article
            return categoriesWithCounts.filter(cat => cat.count > 0)
        } catch (err) {
            console.error("Failed to fetch categories", err)
            return []
        }
    }, [])

    return {
        isLoading,
        error,
        fetchPublishedArticles,
        fetchArticlesByCategory,
        fetchArticlesByTag,
        fetchArticleBySlug,
        fetchRelatedArticles,
        fetchFeaturedArticles,
        fetchLatestArticles,
        fetchPopularArticles,
        fetchCategories,
        incrementViewCount,
        fetchAdjacentArticles
    }
}
