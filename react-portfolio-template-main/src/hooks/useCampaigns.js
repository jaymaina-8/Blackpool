import { useState, useCallback } from 'react'
import { marketingService } from '/src/services/marketingService.js'

export function useCampaigns() {
    const [activeCampaign, setActiveCampaign] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchActiveCampaign = useCallback(async () => {
        setLoading(true)
        try {
            const data = await marketingService.getActiveCampaign()
            setActiveCampaign(data)
            return data
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        activeCampaign,
        loading,
        fetchActiveCampaign
    }
}
