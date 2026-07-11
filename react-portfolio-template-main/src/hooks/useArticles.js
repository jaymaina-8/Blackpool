import { useCallback, useState } from 'react'
import { supabase } from '/src/utils/supabase.js'
import { useAuth } from '/src/providers/AuthProvider.jsx'

const RESERVED_SLUGS = ['admin', 'api', 'login', 'blog', 'settings', 'media', 'categories', 'tags']

export function useArticles() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const generateSlug = (text) => {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    const validateSlug = async (slug, excludeId = null) => {
        if (RESERVED_SLUGS.includes(slug)) {
            return { isValid: false, error: 'This slug is reserved for system use.' }
        }

        let query = supabase.from('articles').select('id').eq('slug', slug)
        if (excludeId) {
            query = query.neq('id', excludeId)
        }
        const { data } = await query.maybeSingle()
        
        if (data) {
            return { isValid: false, error: 'This slug is already in use.' }
        }
        return { isValid: true }
    }

    const fetchArticles = useCallback(async (options = {}) => {
        setIsLoading(true)
        setError(null)
        try {
            let query = supabase
                .from('articles')
                .select(`
                    id, title, slug, status, published_at, updated_at,
                    author:profiles!articles_author_id_fkey(full_name),
                    category:categories!articles_category_id_fkey(name)
                `)
                .is('deleted_at', null)

            if (options.status) query = query.eq('status', options.status)
            if (options.category_id) query = query.eq('category_id', options.category_id)
            if (options.search) query = query.ilike('title', `%${options.search}%`)

            // Order by updated_at desc by default
            query = query.order('updated_at', { ascending: false })

            const { data, error } = await query
            if (error) throw error
            return data
        } catch (err) {
            setError(err.message)
            return []
        } finally {
            setIsLoading(false)
        }
    }, [])

    const fetchArticleById = useCallback(async (id) => {
        setIsLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('articles')
                .select(`
                    *,
                    cover:media!articles_cover_image_id_fkey(id, storage_path, filename),
                    article_tags(tag_id)
                `)
                .eq('id', id)
                .single()
            if (error) throw error
            return data
        } catch (err) {
            setError(err.message)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    const createArticle = useCallback(async (articleData, tagIds = []) => {
        if (!user) throw new Error("Unauthorized")
        setIsLoading(true)
        setError(null)
        try {
            // Validate slug
            const validation = await validateSlug(articleData.slug)
            if (!validation.isValid) throw new Error(validation.error)

            const { data, error } = await supabase.from('articles').insert({
                ...articleData,
                author_id: user.id
            }).select().single()

            if (error) throw error

            // Insert tags if any
            if (tagIds.length > 0) {
                const tagInserts = tagIds.map(tagId => ({ article_id: data.id, tag_id: tagId }))
                const { error: tagError } = await supabase.from('article_tags').insert(tagInserts)
                if (tagError) console.error("Failed to insert tags:", tagError) // non-fatal for article creation
            }

            return data
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [user])

    const updateArticle = useCallback(async (id, articleData, tagIds = []) => {
        setIsLoading(true)
        setError(null)
        try {
            if (articleData.slug) {
                const validation = await validateSlug(articleData.slug, id)
                if (!validation.isValid) throw new Error(validation.error)
            }

            // Ensure updated_at is refreshed
            articleData.updated_at = new Date().toISOString()

            const { data, error } = await supabase.from('articles').update(articleData).eq('id', id).select().single()
            if (error) throw error

            // Update tags: simple approach is delete all and re-insert
            // In a real high-perf app, we'd diff them, but this is an admin panel for a single article.
            await supabase.from('article_tags').delete().eq('article_id', id)
            if (tagIds.length > 0) {
                const tagInserts = tagIds.map(tagId => ({ article_id: id, tag_id: tagId }))
                await supabase.from('article_tags').insert(tagInserts)
            }

            return data
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Soft delete
    const deleteArticle = useCallback(async (id) => {
        setIsLoading(true)
        setError(null)
        try {
            const { error } = await supabase.from('articles').update({ 
                status: 'deleted', 
                deleted_at: new Date().toISOString() 
            }).eq('id', id)
            
            if (error) throw error
            return true
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    return {
        isLoading,
        error,
        generateSlug,
        validateSlug,
        fetchArticles,
        fetchArticleById,
        createArticle,
        updateArticle,
        deleteArticle
    }
}
