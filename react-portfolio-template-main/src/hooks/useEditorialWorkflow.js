import { useState, useCallback } from 'react'
import { supabase } from '/src/utils/supabase.js'
import { useAuth } from '/src/providers/AuthProvider.jsx'

export function useEditorialWorkflow() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const changeStatus = useCallback(async (articleId, currentStatus, newStatus, comment = '') => {
        setLoading(true)
        setError(null)
        try {
            // 1. Update article status
            const { error: updateError } = await supabase
                .from('articles')
                .update({ status: newStatus })
                .eq('id', articleId)

            if (updateError) throw updateError

            // 2. Log workflow history
            const { error: historyError } = await supabase
                .from('workflow_history')
                .insert({
                    article_id: articleId,
                    previous_status: currentStatus,
                    new_status: newStatus,
                    changed_by: user?.id,
                    comment: comment
                })
            
            if (historyError) throw historyError

            return true
        } catch (err) {
            console.error('Failed to change status:', err)
            setError(err.message)
            return false
        } finally {
            setLoading(false)
        }
    }, [user])

    const fetchHistory = useCallback(async (articleId) => {
        try {
            const { data, error } = await supabase
                .from('workflow_history')
                .select('*, changed_by:profiles(full_name, avatar_url)')
                .eq('article_id', articleId)
                .order('created_at', { ascending: false })
            
            if (error) throw error
            return data
        } catch (err) {
            console.error('Failed to fetch history:', err)
            return []
        }
    }, [])

    return {
        changeStatus,
        fetchHistory,
        loading,
        error
    }
}
