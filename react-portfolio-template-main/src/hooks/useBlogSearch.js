import { useState, useCallback } from 'react'
import { supabase } from '/src/utils/supabase.js'

export function useBlogSearch() {
    const [isSearching, setIsSearching] = useState(false)
    const [searchError, setSearchError] = useState(null)

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

    const performSearch = useCallback(async (queryStr, { page = 1, limit = 12 } = {}) => {
        if (!queryStr || queryStr.trim() === '') {
            return { articles: [], count: 0 }
        }

        setIsSearching(true)
        setSearchError(null)

        try {
            let query = supabase
                .rpc('search_published_articles', { search_query: queryStr }, { count: 'exact' })
                .select(`
                    id, title, slug, excerpt, published_at, updated_at, is_featured, view_count,
                    author:profiles!articles_author_id_fkey(full_name, avatar_url),
                    category:categories!articles_category_id_fkey(name, slug),
                    cover:media!articles_cover_image_id_fkey(storage_path, alt_text, width, height)
                `)

            const from = (page - 1) * limit
            const to = from + limit - 1
            query = query.range(from, to)

            const { data, error, count } = await query

            if (error) throw error

            return { articles: mapCoverUrls(data || []), count: count || 0 }
        } catch (err) {
            console.error("Search error:", err)
            setSearchError(err.message)
            return { articles: [], count: 0 }
        } finally {
            setIsSearching(false)
        }
    }, [])

    return {
        isSearching,
        searchError,
        performSearch
    }
}
