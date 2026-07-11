import { supabase } from '/src/utils/supabase.js'
import { MARKETING_PLACEMENTS } from '/src/constants/marketing.js'
import { ctaConfigFallback } from '/src/config/ctaConfig.js'
import { leadMagnetsFallback } from '/src/config/leadMagnetsConfig.js'

class MarketingService {
    async getGlobalSettings() {
        try {
            const { data, error } = await supabase
                .from('marketing_settings')
                .select('*')
                .eq('id', 1)
                .single()
            if (error) throw error
            return data
        } catch (err) {
            console.error("Failed to load marketing settings:", err)
            return {
                company_name: 'Blackpool Industry',
                enable_cta: true,
                enable_banner: true,
                enable_newsletter: true,
                enable_lead_magnets: true
            }
        }
    }

    async getActiveCampaign() {
        try {
            const now = new Date().toISOString()
            const { data, error } = await supabase
                .from('marketing_campaigns')
                .select('*')
                .eq('status', 'active')
                .lte('start_date', now)
                .gte('end_date', now)
                .order('start_date', { ascending: false })
                .limit(1)
                .single()
            
            if (error && error.code !== 'PGRST116') throw error
            return data || null
        } catch (err) {
            console.error("Failed to fetch active campaign:", err)
            return null
        }
    }

    async getActiveCTAs(placement = MARKETING_PLACEMENTS.ANY, category = null, tag = null) {
        try {
            let query = supabase
                .from('marketing_ctas')
                .select('*')
                .eq('status', 'active')
                .order('priority', { ascending: false })
            
            if (placement !== MARKETING_PLACEMENTS.ANY) {
                query = query.in('placement', [placement, MARKETING_PLACEMENTS.ANY])
            }

            const { data, error } = await query
            if (error) throw error

            const now = new Date()
            let validCtas = (data || []).filter(cta => {
                const isStarted = !cta.start_date || new Date(cta.start_date) <= now
                const isNotExpired = !cta.end_date || new Date(cta.end_date) >= now
                
                let matchesCategory = true
                if (cta.target_category && category && cta.target_category !== category) {
                    matchesCategory = false
                }
                
                let matchesTag = true
                if (cta.target_tag && tag && cta.target_tag !== tag) {
                    matchesTag = false
                }

                // Check device (basic implementation, assumes 'all' if window isn't defined or device is 'all')
                let matchesDevice = true
                if (cta.device && cta.device !== 'all' && typeof window !== 'undefined') {
                    const isMobile = window.innerWidth <= 768
                    if (cta.device === 'mobile' && !isMobile) matchesDevice = false
                    if (cta.device === 'desktop' && isMobile) matchesDevice = false
                }

                return isStarted && isNotExpired && matchesCategory && matchesTag && matchesDevice
            })
            
            if (validCtas.length === 0) {
                return this.getFallbackCTAs(placement)
            }
            return validCtas
        } catch (err) {
            console.error("Failed to fetch CTAs, using fallback:", err)
            return this.getFallbackCTAs(placement)
        }
    }

    getFallbackCTAs(placement) {
        if (placement === MARKETING_PLACEMENTS.ANY) return ctaConfigFallback
        return ctaConfigFallback.filter(c => c.placement === placement || c.placement === MARKETING_PLACEMENTS.ANY)
    }

    async getActiveLeadMagnets() {
        try {
            const { data, error } = await supabase
                .from('lead_magnets')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false })
            
            if (error) throw error
            
            if (!data || data.length === 0) return leadMagnetsFallback
            return data
        } catch (err) {
            console.error("Failed to fetch lead magnets, using fallback:", err)
            return leadMagnetsFallback
        }
    }

    async captureLead(magnet, userData) {
        try {
            const { name, email, source } = userData

            if (magnet.email_required || email) {
                const { error } = await supabase
                    .from('lead_downloads')
                    .insert([{
                        magnet_id: magnet.id,
                        email,
                        name: name || null,
                        source: source || 'direct'
                    }])

                if (error) throw error
            }
            return { success: true }
        } catch (err) {
            console.error("Failed to capture lead:", err)
            return { success: false, error: err }
        }
    }
}

export const marketingService = new MarketingService()
