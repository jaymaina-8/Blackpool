import { providers } from './providers.js'
import { ANALYTICS_EVENTS } from './constants.js'

// Simple debounce to prevent double-clicks spamming analytics
const recentEvents = new Set()

export const trackEvent = (eventName, properties = {}) => {
    // Basic validation
    if (!Object.values(ANALYTICS_EVENTS).includes(eventName)) {
        // Unknown event detected
    }

    // Debounce check (prevent exact same event+properties within 1 second)
    const eventKey = `${eventName}-${JSON.stringify(properties)}`
    if (recentEvents.has(eventKey)) return
    
    // Enrich with metadata
    const enrichedProperties = {
        ...properties,
        page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
        referrer: typeof document !== 'undefined' ? document.referrer : 'unknown',
        device: typeof window !== 'undefined' ? (window.innerWidth <= 768 ? 'mobile' : 'desktop') : 'unknown',
        browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        timestamp: new Date().toISOString()
    }
    
    recentEvents.add(eventKey)
    setTimeout(() => recentEvents.delete(eventKey), 1000)

    // Log to console in development
    if (import.meta.env.DEV) {
        // Logs removed for production cleanup
    }

    // Route event through all configured providers
    Object.values(providers).forEach(providerFn => {
        try {
            providerFn(eventName, enrichedProperties)
        } catch (e) {
            console.error(`[Analytics] Provider failed for ${eventName}:`, e)
        }
    })
}
