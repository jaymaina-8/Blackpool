import React, { useEffect, useState } from 'react'
import { useAnalytics } from '/src/hooks/useAnalytics.js'

export default function ArticleScrollTracker({ articleId }) {
    const { trackScrollDepth } = useAnalytics()
    const [reportedDepths, setReportedDepths] = useState(new Set())

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight
            const winHeight = window.innerHeight
            const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100

            const thresholds = [25, 50, 75, 100]
            
            thresholds.forEach(threshold => {
                if (scrollPercent >= threshold && !reportedDepths.has(threshold)) {
                    trackScrollDepth(window.location.pathname, threshold, articleId)
                    setReportedDepths(prev => new Set([...prev, threshold]))
                }
            })
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [articleId, reportedDepths, trackScrollDepth])

    return null
}
