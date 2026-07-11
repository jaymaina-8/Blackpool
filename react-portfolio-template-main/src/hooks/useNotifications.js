import { useState, useCallback, useEffect } from 'react'
import { supabase } from '/src/utils/supabase.js'
import { useAuth } from '/src/providers/AuthProvider.jsx'

export function useNotifications() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)

    const fetchNotifications = useCallback(async () => {
        if (!user) return
        
        try {
            const { data, error } = await supabase
                .from('editorial_notifications')
                .select('*, actor:profiles!editorial_notifications_actor_id_fkey(full_name, avatar_url), article:articles(title, slug)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50)
            
            if (error) throw error
            
            setNotifications(data || [])
            setUnreadCount(data?.filter(n => !n.read).length || 0)
        } catch (err) {
            console.error('Failed to fetch notifications:', err)
        }
    }, [user])

    const markAsRead = useCallback(async (notificationId) => {
        try {
            const { error } = await supabase
                .from('editorial_notifications')
                .update({ read: true })
                .eq('id', notificationId)
            
            if (error) throw error
            
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
            return true
        } catch (err) {
            console.error('Failed to mark notification as read:', err)
            return false
        }
    }, [])

    const markAllAsRead = useCallback(async () => {
        if (!user) return
        try {
            const { error } = await supabase
                .from('editorial_notifications')
                .update({ read: true })
                .eq('user_id', user.id)
                .eq('read', false)
            
            if (error) throw error
            
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
            return true
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err)
            return false
        }
    }, [user])

    useEffect(() => {
        fetchNotifications()

        // Set up realtime subscription
        if (user) {
            const channel = supabase
                .channel('custom-all-channel')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'editorial_notifications', filter: `user_id=eq.${user.id}` },
                    (payload) => {
                        fetchNotifications()
                    }
                )
                .subscribe()
            
            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [user, fetchNotifications])

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications
    }
}
