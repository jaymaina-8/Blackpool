import { useState, useCallback } from 'react'
import { marketingService } from '/src/services/marketingService.js'

export function useMarketing() {
    const [ctas, setCtas] = useState([])
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState(null)

    const fetchSettings = useCallback(async () => {
        const data = await marketingService.getGlobalSettings()
        setSettings(data)
        return data
    }, [])

    const fetchActiveCTAs = useCallback(async (placement = 'any', category = null, tag = null) => {
        setLoading(true)
        try {
            const data = await marketingService.getActiveCTAs(placement, category, tag)
            setCtas(data)
            return data
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        ctas,
        settings,
        loading,
        fetchActiveCTAs,
        fetchSettings
    }
}
