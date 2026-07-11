import { useState, useCallback } from 'react'
import { marketingService } from '/src/services/marketingService.js'
import { track, EVENTS } from '/src/utils/analytics/index.js'

export function useLeadMagnets() {
    const [magnets, setMagnets] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchActiveMagnets = useCallback(async () => {
        setLoading(true)
        try {
            const data = await marketingService.getActiveLeadMagnets()
            setMagnets(data)
            return data
        } finally {
            setLoading(false)
        }
    }, [])

    const captureLeadAndDownload = async (magnet, userData) => {
        const result = await marketingService.captureLead(magnet, userData)
        
        if (result.success) {
            track(EVENTS.LEAD_MAGNET_DOWNLOADED, { magnet_id: magnet.id, magnet_title: magnet.title, version: magnet.version })
            
            if (magnet.file_url && typeof window !== 'undefined') {
                window.open(magnet.file_url, '_blank')
            }
        }
        
        return result
    }

    return {
        magnets,
        loading,
        fetchActiveMagnets,
        captureLeadAndDownload
    }
}
