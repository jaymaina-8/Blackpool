import { useState, useCallback } from 'react'
import { supabase } from '/src/utils/supabase.js'
import { useAuth } from '/src/providers/AuthProvider.jsx'

export function useArticleVersions() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const saveVersion = useCallback(async (articleId, title, excerpt, content_json, html_content, summary = 'Auto-save') => {
        setLoading(true)
        setError(null)
        try {
            // Determine next version number
            const { data: latestVersion, error: fetchError } = await supabase
                .from('article_versions')
                .select('version')
                .eq('article_id', articleId)
                .order('version', { ascending: false })
                .limit(1)
            
            if (fetchError) throw fetchError

            const nextVersion = latestVersion && latestVersion.length > 0 ? latestVersion[0].version + 1 : 1

            const { error: insertError } = await supabase
                .from('article_versions')
                .insert({
                    article_id: articleId,
                    version: nextVersion,
                    title,
                    excerpt,
                    content_json,
                    html_content,
                    created_by: user?.id,
                    change_summary: summary
                })
            
            if (insertError) throw insertError

            return true
        } catch (err) {
            console.error('Failed to save version:', err)
            setError(err.message)
            return false
        } finally {
            setLoading(false)
        }
    }, [user])

    const fetchVersions = useCallback(async (articleId) => {
        try {
            const { data, error } = await supabase
                .from('article_versions')
                .select('*, created_by:profiles(full_name, avatar_url)')
                .eq('article_id', articleId)
                .order('version', { ascending: false })
            
            if (error) throw error
            return data
        } catch (err) {
            console.error('Failed to fetch versions:', err)
            return []
        }
    }, [])

    return {
        saveVersion,
        fetchVersions,
        loading,
        error
    }
}
