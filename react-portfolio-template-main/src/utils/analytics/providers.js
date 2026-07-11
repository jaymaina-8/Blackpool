import { eventQueue } from './eventQueue.js'

export const providers = {
    // GA4 Integration Stub
    ga4: (eventName, properties) => {
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', eventName, properties)
        }
    },
    
    // PostHog Integration Stub
    posthog: (eventName, properties) => {
        if (typeof window !== 'undefined' && window.posthog) {
            window.posthog.capture(eventName, properties)
        }
    },
    
    // Plausible Integration Stub
    plausible: (eventName, properties) => {
        if (typeof window !== 'undefined' && window.plausible) {
            window.plausible(eventName, { props: properties })
        }
    },

    // Supabase (for internal CMS marketing dashboard)
    supabase: async (eventName, properties) => {
        // We only send specific conversion/marketing events to our internal Supabase events table 
        // to avoid storing massive amounts of raw page views in our own DB.
        const dashboardEvents = [
            'cta_clicked',
            'newsletter_submitted',
            'homepage_newsletter_submitted',
            'lead_magnet_downloaded',
            'consultation_requested',
            'author_profile_viewed',
            'author_follow_clicked'
        ]
        
        if (dashboardEvents.includes(eventName)) {
            try {
                eventQueue.add({
                    event_type: eventName,
                    event_name: eventName,
                    properties: properties,
                    session_id: typeof window !== 'undefined' ? localStorage.getItem('session_id') : null
                })
            } catch (err) {
                console.error("Failed to queue analytics for Supabase", err)
            }
        }
    }
}
