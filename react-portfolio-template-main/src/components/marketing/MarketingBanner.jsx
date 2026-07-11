import React, { useState, useEffect } from 'react'
import { useCampaigns } from '/src/hooks/useCampaigns.js'
import { track, EVENTS } from '/src/utils/analytics/index.js'

export default function MarketingBanner() {
    const { activeCampaign, loading, fetchActiveCampaign } = useCampaigns()
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        fetchActiveCampaign().then(campaign => {
            if (campaign?.banner_enabled) {
                // Check if user has dismissed it
                const dismissed = localStorage.getItem(`dismissed_banner_${campaign.id}`)
                if (!dismissed) {
                    setIsVisible(true)
                    track(EVENTS.BANNER_VIEWED, { campaign_id: campaign.id, campaign_name: campaign.name })
                }
            }
        })
    }, [fetchActiveCampaign])

    if (loading || !isVisible || !activeCampaign) return null

    const handleDismiss = () => {
        setIsVisible(false)
        localStorage.setItem(`dismissed_banner_${activeCampaign.id}`, 'true')
        track(EVENTS.BANNER_DISMISSED, { campaign_id: activeCampaign.id })
    }

    const handleClick = () => {
        track(EVENTS.BANNER_CLICKED, { campaign_id: activeCampaign.id })
        if (activeCampaign.banner_url) {
            window.location.href = activeCampaign.banner_url
        }
    }

    return (
        <div className={`bg-${activeCampaign.banner_color || 'primary'} text-white py-2 px-4 d-flex justify-content-center align-items-center position-relative`} style={{ zIndex: 1050 }}>
            <div 
                className="text-center fw-medium small text-decoration-none text-white d-flex align-items-center gap-2" 
                style={{ cursor: activeCampaign.banner_url ? 'pointer' : 'default' }}
                onClick={activeCampaign.banner_url ? handleClick : undefined}
            >
                <i className="fa-solid fa-bullhorn d-none d-sm-block"></i>
                <span dangerouslySetInnerHTML={{ __html: activeCampaign.banner_text || activeCampaign.name }} />
                {activeCampaign.banner_url && <i className="fa-solid fa-arrow-right ms-1"></i>}
            </div>
            <button 
                className="btn btn-link text-white position-absolute end-0 top-50 translate-middle-y me-2 p-1"
                onClick={handleDismiss}
                aria-label="Dismiss"
            >
                <i className="fa-solid fa-xmark"></i>
            </button>
        </div>
    )
}
