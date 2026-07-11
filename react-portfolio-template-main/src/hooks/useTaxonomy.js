import { useCallback, useState } from 'react'
import { supabase } from '/src/utils/supabase.js'
import { useAuth } from '/src/providers/AuthProvider.jsx'

export function useTaxonomy() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    // Generate unique slug
    const generateUniqueSlug = async (table, baseSlug) => {
        let slug = baseSlug
        let counter = 1
        let isUnique = false

        while (!isUnique) {
            const { data } = await supabase.from(table).select('id').eq('slug', slug).maybeSingle()
            if (!data) {
                isUnique = true
            } else {
                slug = `${baseSlug}-${counter}`
                counter++
            }
        }
        return slug
    }

    const generateSlug = (text) => {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    // --- CATEGORIES ---

    const fetchCategories = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*, articles(count)')
                .order('display_order', { ascending: true })
                .order('name', { ascending: true })
            if (error) throw error
            
            return data.map(c => ({
                ...c,
                article_count: c.articles?.[0]?.count || 0
            }))
        } catch (err) {
            setError(err.message)
            return []
        } finally {
            setIsLoading(false)
        }
    }, [])

    const createCategory = useCallback(async (categoryData) => {
        if (!user) throw new Error("Unauthorized")
        setIsLoading(true)
        setError(null)
        try {
            const baseSlug = generateSlug(categoryData.name)
            const slug = await generateUniqueSlug('categories', baseSlug)

            const { data, error } = await supabase.from('categories').insert({
                ...categoryData,
                slug,
                created_by: user.id
            }).select().single()

            if (error) throw error
            return data
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [user])

    const updateCategory = useCallback(async (id, categoryData) => {
        setIsLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase.from('categories').update(categoryData).eq('id', id).select().single()
            if (error) throw error
            return data
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    const deleteCategory = useCallback(async (id) => {
        setIsLoading(true)
        setError(null)
        try {
            const { error } = await supabase.from('categories').delete().eq('id', id)
            if (error) throw error
            return true
        } catch (err) {
            // We pass the error back because it might be a RESTRICT violation (code 23503)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    const reassignAndDeleteCategory = useCallback(async (oldId, newId) => {
        setIsLoading(true)
        setError(null)
        try {
            // 1. Reassign articles
            const { error: updateError } = await supabase.from('articles').update({ category_id: newId }).eq('category_id', oldId)
            if (updateError) throw updateError

            // 2. Delete old category
            const { error: deleteError } = await supabase.from('categories').delete().eq('id', oldId)
            if (deleteError) throw deleteError
            
            return true
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    // --- TAGS ---

    const fetchTags = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('tags')
                .select('*, article_tags(count)')
                .order('name', { ascending: true })
            if (error) throw error
            
            return data.map(t => ({
                ...t,
                article_count: t.article_tags?.[0]?.count || 0
            }))
        } catch (err) {
            setError(err.message)
            return []
        } finally {
            setIsLoading(false)
        }
    }, [])

    const createTag = useCallback(async (name) => {
        if (!user) throw new Error("Unauthorized")
        setIsLoading(true)
        setError(null)
        try {
            const baseSlug = generateSlug(name)
            const slug = await generateUniqueSlug('tags', baseSlug)

            const { data, error } = await supabase.from('tags').insert({
                name,
                slug,
                created_by: user.id
            }).select().single()

            if (error) throw error
            return data
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [user])

    const updateTag = useCallback(async (id, name) => {
        setIsLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase.from('tags').update({ name }).eq('id', id).select().single()
            if (error) throw error
            return data
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    const deleteTag = useCallback(async (id) => {
        setIsLoading(true)
        setError(null)
        try {
            const { error } = await supabase.from('tags').delete().eq('id', id)
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
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        reassignAndDeleteCategory,
        fetchTags,
        createTag,
        updateTag,
        deleteTag
    }
}
