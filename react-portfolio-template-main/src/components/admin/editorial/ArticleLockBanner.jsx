import React, { useState, useEffect } from 'react'
import { supabase } from '/src/utils/supabase.js'
import { useAuth } from '/src/providers/AuthProvider.jsx'

export default function ArticleLockBanner({ articleId }) {
    const { user } = useAuth()
    const [lockedBy, setLockedBy] = useState(null)
    const [lastActivity, setLastActivity] = useState(null)
    const [isLocked, setIsLocked] = useState(false)

    useEffect(() => {
        if (!articleId || !user) return

        let heartbeatInterval = null

        const checkLock = async () => {
            const { data, error } = await supabase
                .from('article_locks')
                .select('*, locked_by_profile:profiles!article_locks_locked_by_fkey(full_name)')
                .eq('article_id', articleId)
                .single()

            if (data && new Date(data.expires_at) > new Date()) {
                if (data.locked_by !== user.id) {
                    setIsLocked(true)
                    setLockedBy(data.locked_by_profile?.full_name || 'Another user')
                    
                    // We deduce last activity from expires_at - 15 mins (or locked_at if we use that)
                    // The simplest is to just use locked_at or calculate from expires_at
                    const activeTime = new Date(new Date(data.expires_at).getTime() - 15 * 60000)
                    const diffMins = Math.round((new Date() - activeTime) / 60000)
                    setLastActivity(`${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`)
                } else {
                    // We own the lock, renew it
                    setIsLocked(false)
                    renewLock()
                }
            } else {
                // No valid lock, acquire it
                setIsLocked(false)
                acquireLock()
            }
        }

        const acquireLock = async () => {
            const expiresAt = new Date()
            expiresAt.setMinutes(expiresAt.getMinutes() + 15) // 15 min lock

            await supabase
                .from('article_locks')
                .upsert({
                    article_id: articleId,
                    locked_by: user.id,
                    expires_at: expiresAt.toISOString(),
                    locked_at: new Date().toISOString()
                })
        }

        const renewLock = async () => {
            const expiresAt = new Date()
            expiresAt.setMinutes(expiresAt.getMinutes() + 15)

            await supabase
                .from('article_locks')
                .update({ expires_at: expiresAt.toISOString() })
                .eq('article_id', articleId)
                .eq('locked_by', user.id)
        }

        checkLock()
        heartbeatInterval = setInterval(checkLock, 5 * 60 * 1000) // check/renew every 5 mins

        return () => {
            if (heartbeatInterval) clearInterval(heartbeatInterval)
            if (!isLocked && user) {
                supabase.from('article_locks').delete().eq('article_id', articleId).eq('locked_by', user.id).then()
            }
        }
    }, [articleId, user, isLocked])

    if (!isLocked) return null

    return (
        <div className="alert alert-warning d-flex align-items-center gap-3 border-0 rounded-0 m-0 py-2">
            <i className="fa-solid fa-triangle-exclamation fs-5"></i>
            <div>
                <strong>{lockedBy} is currently editing this article.</strong> Last activity: {lastActivity}. You may still edit, but conflicts could occur.
            </div>
        </div>
    )
}
