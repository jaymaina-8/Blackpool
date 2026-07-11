import { useEffect } from 'react'
import { supabase } from '/src/utils/supabase.js'

// Generate a simple anonymous session ID stored in sessionStorage
const getSessionId = () => {
    let sid = sessionStorage.getItem('analytics_session_id')
    if (!sid) {
        sid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)
        sessionStorage.setItem('analytics_session_id', sid)
    }
    return sid
}

export function useAnalytics() {
    const trackEvent = async (eventType, path, properties = {}, articleId = null) => {
        try {
            await supabase.from('analytics_events').insert([{
                event_type: eventType,
                session_id: getSessionId(),
                path: path || window.location.pathname,
                referrer: document.referrer || null,
                device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
                properties: { ...properties, timestamp: Date.now() },
                article_id: articleId
            }])
        } catch (e) {
            console.error('Analytics tracking failed', e)
        }
    }

    const trackPageView = (path, articleId = null) => {
        trackEvent('page_view', path, {}, articleId)
    }

    const trackScrollDepth = (path, depthPercent, articleId = null) => {
        trackEvent('scroll_depth', path, { scroll_percent: depthPercent }, articleId)
    }

    const trackSearch = async (query, resultsCount, clickedArticleId = null) => {
        try {
            await supabase.from('search_analytics').insert([{
                query,
                results_count: resultsCount,
                clicked_article_id: clickedArticleId,
                session_id: getSessionId()
            }])

            // Phase 9.8 (Intelligence) Search Opportunities
            if (resultsCount === 0) {
                // Upsert logic for search opportunities
                const { data } = await supabase.from('search_opportunities').select('id, search_count').eq('query', query.toLowerCase()).single()
                if (data) {
                    await supabase.from('search_opportunities').update({ 
                        search_count: data.search_count + 1, 
                        last_searched_at: new Date().toISOString() 
                    }).eq('id', data.id)
                } else {
                    await supabase.from('search_opportunities').insert([{ query: query.toLowerCase(), search_count: 1 }])
                }
            }
        } catch (e) {
            console.error('Search tracking failed', e)
        }
    }

    const trackWebVitals = async (metric) => {
        try {
            let rating = 'good'
            if (metric.name === 'LCP') rating = metric.value > 2500 ? (metric.value > 4000 ? 'poor' : 'needs-improvement') : 'good'
            if (metric.name === 'FCP') rating = metric.value > 1800 ? (metric.value > 3000 ? 'poor' : 'needs-improvement') : 'good'
            if (metric.name === 'CLS') rating = metric.value > 0.1 ? (metric.value > 0.25 ? 'poor' : 'needs-improvement') : 'good'
            if (metric.name === 'INP') rating = metric.value > 200 ? (metric.value > 500 ? 'poor' : 'needs-improvement') : 'good'
            
            await supabase.from('core_web_vitals').insert([{
                metric_name: metric.name,
                metric_value: metric.value,
                rating,
                path: window.location.pathname,
                session_id: getSessionId()
            }])
        } catch (e) {
            console.error('Web Vitals tracking failed', e)
        }
    }

    return { trackEvent, trackPageView, trackScrollDepth, trackSearch, trackWebVitals, getSessionId }
}
