import React, { useEffect, useState, useRef } from 'react'
import { useMarketing } from '/src/hooks/useMarketing.js'
import { track, EVENTS } from '/src/utils/analytics/index.js'
import { MARKETING_PLACEMENTS } from '/src/constants/marketing.js'

export default function DynamicCTA({ placement = MARKETING_PLACEMENTS.ANY, category = null, tag = null }) {
    const { ctas, loading, fetchActiveCTAs } = useMarketing()
    const [viewed, setViewed] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        fetchActiveCTAs(placement, category, tag)
    }, [placement, category, tag, fetchActiveCTAs])

    // Find the best CTA. If a category matches the campaign or specific logic, pick it.
    // For now, we take the highest priority CTA that matches the placement (since useMarketing sorts by priority).
    // In a real A/B testing scenario, we would use the weight attribute.
    const cta = ctas.length > 0 ? ctas[0] : null

    useEffect(() => {
        if (!cta) return
        
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !viewed) {
                setViewed(true)
                track(EVENTS.CTA_VIEWED, { cta_id: cta.id, cta_title: cta.title, placement })
            }
        }, { threshold: 0.5 })
        
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [cta, viewed, placement])

    if (loading) return (
        <div className="bg-light rounded-4 p-5 text-center my-5 placeholder-glow border">
            <span className="placeholder col-6 rounded mb-3 bg-secondary"></span><br/>
            <span className="placeholder col-8 rounded mb-4 bg-secondary"></span>
        </div>
    )

    if (!cta) return null

    const appendUtms = (url, type) => {
        if (!url || url === '#') return url
        try {
            const baseUrl = url.startsWith('/') ? window.location.origin + url : url
            const urlObj = new URL(baseUrl)
            if (!urlObj.searchParams.has('utm_source')) urlObj.searchParams.append('utm_source', 'website')
            if (!urlObj.searchParams.has('utm_medium')) urlObj.searchParams.append('utm_medium', 'cta')
            if (!urlObj.searchParams.has('utm_campaign')) urlObj.searchParams.append('utm_campaign', cta.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
            if (!urlObj.searchParams.has('utm_content')) urlObj.searchParams.append('utm_content', `${placement}_${type}`)
            
            return url.startsWith('/') ? urlObj.pathname + urlObj.search : urlObj.toString()
        } catch (e) {
            return url
        }
    }

    return (
        <div 
            ref={ref} 
            className={`bg-${cta.background_style || 'primary'} bg-opacity-10 rounded-4 p-5 text-center my-5 shadow-sm border border-${cta.background_style || 'primary'} border-opacity-25`}
        >
            <h2 className="fw-bold mb-3 tracking-tight" style={{ color: '#1a1a1a', letterSpacing: '-0.5px' }}>
                {cta.icon && <i className={`fa-solid ${cta.icon} text-${cta.background_style || 'primary'} me-3`}></i>}
                {cta.title}
            </h2>
            {cta.subtitle && (
                <h4 className="fw-medium text-muted mb-2">{cta.subtitle}</h4>
            )}
            <p className="lead text-muted mb-4 mx-auto" style={{ maxWidth: '600px' }}>
                {cta.description}
            </p>
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                {cta.primary_button_text && (
                    <a 
                        href={appendUtms(cta.primary_button_url, 'primary')} 
                        className={`btn btn-${cta.background_style || 'primary'} btn-lg px-4 rounded-pill fw-medium text-white`}
                        onClick={() => track(EVENTS.CTA_CLICKED, { cta_id: cta.id, type: 'primary', placement })}
                        aria-label={cta.primary_button_text}
                    >
                        {cta.primary_button_text}
                    </a>
                )}
                {cta.secondary_button_text && (
                    <a 
                        href={appendUtms(cta.secondary_button_url, 'secondary')} 
                        className={`btn btn-outline-${cta.background_style || 'primary'} btn-lg px-4 rounded-pill fw-medium bg-white`}
                        onClick={() => track(EVENTS.CTA_CLICKED, { cta_id: cta.id, type: 'secondary', placement })}
                        aria-label={cta.secondary_button_text}
                    >
                        {cta.secondary_button_text}
                    </a>
                )}
            </div>
        </div>
    )
}
