import { useState, useCallback } from 'react'
import { supabase } from '/src/utils/supabase.js'
import { useAuth } from '/src/providers/AuthProvider.jsx'

export function useEditorialComments() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchComments = useCallback(async (articleId) => {
        try {
            const { data, error } = await supabase
                .from('editorial_comments')
                .select('*, author:profiles!editorial_comments_author_id_fkey(full_name, avatar_url), resolved_by_profile:profiles!editorial_comments_resolved_by_fkey(full_name)')
                .eq('article_id', articleId)
                .order('created_at', { ascending: true })
            
            if (error) throw error
            return data
        } catch (err) {
            console.error('Failed to fetch comments:', err)
            return []
        }
    }, [])

    const addComment = useCallback(async (articleId, content, blockReference = null) => {
        setLoading(true)
        setError(null)
        try {
            const { data, error: insertError } = await supabase
                .from('editorial_comments')
                .insert({
                    article_id: articleId,
                    author_id: user?.id,
                    content,
                    block_reference: blockReference
                })
                .select('*, author:profiles!editorial_comments_author_id_fkey(full_name, avatar_url)')
                .single()
            
            if (insertError) throw insertError
            return data
        } catch (err) {
            console.error('Failed to add comment:', err)
            setError(err.message)
            return null
        } finally {
            setLoading(false)
        }
    }, [user])

    const resolveComment = useCallback(async (commentId) => {
        setLoading(true)
        setError(null)
        try {
            const { error: updateError } = await supabase
                .from('editorial_comments')
                .update({ 
                    resolved: true, 
                    resolved_at: new Date().toISOString(),
                    resolved_by: user?.id
                })
                .eq('id', commentId)
            
            if (updateError) throw updateError
            return true
        } catch (err) {
            console.error('Failed to resolve comment:', err)
            setError(err.message)
            return false
        } finally {
            setLoading(false)
        }
    }, [user])

    return {
        fetchComments,
        addComment,
        resolveComment,
        loading,
        error
    }
}
