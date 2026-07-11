import React, { useEffect } from 'react'
import { onLCP, onFCP, onCLS, onINP, onTTFB } from 'web-vitals'
import { useAnalytics } from '/src/hooks/useAnalytics.js'

export default function WebVitalsTracker() {
    const { trackWebVitals } = useAnalytics()

    useEffect(() => {
        // Report Web Vitals to our tracking endpoint
        onLCP(trackWebVitals)
        onFCP(trackWebVitals)
        onCLS(trackWebVitals)
        onINP(trackWebVitals)
        onTTFB(trackWebVitals)
    }, [])

    return null
}
