import React, { useEffect, useState } from 'react'
import { supabase } from '/src/utils/supabase.js'

export default function MarketingDashboard() {
    const [stats, setStats] = useState({
        today: { clicks: 0, signups: 0, downloads: 0, impressions: 0 },
        week: { topCta: '-', worstCta: '-', topCampaign: '-', topArticle: '-', topMagnet: '-', conversionRate: '0%', ctr: '0%' }
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)

                // Fetch Today's Events
                const { data: todayEvents } = await supabase
                    .from('marketing_events')
                    .select('*')
                    .gte('created_at', today.toISOString())
                
                const todayStats = { clicks: 0, signups: 0, downloads: 0, consultations: 0 }
                if (todayEvents) {
                    todayEvents.forEach(e => {
                        if (e.event_type === 'cta_clicked' || e.event_type === 'homepage_article_clicked' || e.event_type === 'banner_clicked') todayStats.clicks++
                        if (e.event_type.includes('newsletter_submitted')) todayStats.signups++
                        if (e.event_type === 'lead_magnet_downloaded') todayStats.downloads++
                        if (e.event_type === 'cta_viewed' || e.event_type === 'banner_viewed' || e.event_type === 'lead_magnet_viewed') todayStats.impressions++
                    })
                }

                // Fetch Weekly Events for Top Items
                const { data: weekEvents } = await supabase
                    .from('marketing_events')
                    .select('*')
                    .gte('created_at', weekAgo.toISOString())

                const weekStats = { topCta: '-', worstCta: '-', topCampaign: '-', topArticle: '-', topMagnet: '-', conversionRate: '0%', ctr: '0%' }
                
                if (weekEvents && weekEvents.length > 0) {
                    const ctas = {}, campaigns = {}, articles = {}, magnets = {}
                    let totalImpressions = 0
                    let totalClicks = 0
                    let totalConversions = 0

                    weekEvents.forEach(e => {
                        if (e.event_type.includes('_viewed') || e.event_type === 'page_view') totalImpressions++
                        
                        if (e.event_type === 'cta_clicked') {
                            const title = e.properties?.cta_title || e.properties?.cta_id || 'Unknown CTA'
                            ctas[title] = (ctas[title] || 0) + 1
                            totalClicks++
                            totalConversions++
                        }
                        if (e.event_type === 'cta_viewed') {
                            const title = e.properties?.cta_title || e.properties?.cta_id || 'Unknown CTA'
                            if (!ctas[title]) ctas[title] = 0 // Just to track it exists even if 0 clicks
                        }
                        if (e.event_type === 'banner_clicked') {
                            const title = e.properties?.campaign_name || 'Unknown Campaign'
                            campaigns[title] = (campaigns[title] || 0) + 1
                            totalClicks++
                            totalConversions++
                        }
                        if (e.event_type === 'homepage_article_clicked') {
                            const title = e.properties?.title || 'Unknown Article'
                            articles[title] = (articles[title] || 0) + 1
                            totalClicks++
                        }
                        if (e.event_type === 'lead_magnet_downloaded') {
                            const title = e.properties?.magnet_title || 'Unknown Magnet'
                            magnets[title] = (magnets[title] || 0) + 1
                            totalConversions++
                        }
                        if (e.event_type.includes('newsletter_submitted')) {
                            totalConversions++
                        }
                    })

                    const sortedCtas = Object.entries(ctas).sort((a, b) => b[1] - a[1])
                    const getTop = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
                    
                    weekStats.topCta = sortedCtas.length > 0 ? sortedCtas[0][0] : '-'
                    weekStats.worstCta = sortedCtas.length > 1 ? sortedCtas[sortedCtas.length - 1][0] : '-'
                    weekStats.topCampaign = getTop(campaigns)
                    weekStats.topArticle = getTop(articles)
                    weekStats.topMagnet = getTop(magnets)
                    
                    if (totalImpressions > 0) {
                        weekStats.ctr = ((totalClicks / totalImpressions) * 100).toFixed(1) + '%'
                        weekStats.conversionRate = ((totalConversions / totalImpressions) * 100).toFixed(1) + '%'
                    } else if (totalClicks > 0) {
                         weekStats.ctr = 'Active'
                         weekStats.conversionRate = 'Active'
                    }
                }

                setStats({ today: todayStats, week: weekStats })
            } catch (err) {
                console.error("Error fetching marketing stats:", err)
            } finally {
                setLoading(false)
            }
        }
        
        fetchStats()
    }, [])

    if (loading) return <div className="p-4"><span className="spinner-border text-primary"></span></div>

    return (
        <div className="p-4 p-md-5">
            <h2 className="fw-bold mb-4">Marketing Dashboard</h2>
            
            <h5 className="fw-bold text-muted mb-3">Today's Performance</h5>
            <div className="row g-4 mb-5">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                        <i className="fa-solid fa-hand-pointer fs-1 text-primary mb-3"></i>
                        <h2 className="fw-bold mb-1">{stats.today.clicks}</h2>
                        <span className="text-muted small fw-medium text-uppercase tracking-wider">Clicks</span>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                        <i className="fa-solid fa-envelope fs-1 text-success mb-3"></i>
                        <h2 className="fw-bold mb-1">{stats.today.signups}</h2>
                        <span className="text-muted small fw-medium text-uppercase tracking-wider">Signups</span>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                        <i className="fa-solid fa-download fs-1 text-info mb-3"></i>
                        <h2 className="fw-bold mb-1">{stats.today.downloads}</h2>
                        <span className="text-muted small fw-medium text-uppercase tracking-wider">Downloads</span>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                        <i className="fa-solid fa-eye fs-1 text-warning mb-3"></i>
                        <h2 className="fw-bold mb-1">{stats.today.impressions}</h2>
                        <span className="text-muted small fw-medium text-uppercase tracking-wider">Impressions</span>
                    </div>
                </div>
            </div>

            <h5 className="fw-bold text-muted mb-3">This Week's Top Performers</h5>
            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted small fw-medium text-uppercase tracking-wider">Top CTA</span>
                            <i className="fa-solid fa-bullseye text-primary"></i>
                        </div>
                        <h5 className="fw-bold m-0">{stats.week.topCta}</h5>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted small fw-medium text-uppercase tracking-wider">Worst CTA</span>
                            <i className="fa-solid fa-arrow-trend-down text-danger"></i>
                        </div>
                        <h5 className="fw-bold m-0 text-muted">{stats.week.worstCta}</h5>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted small fw-medium text-uppercase tracking-wider">Top Campaign</span>
                            <i className="fa-solid fa-flag text-danger"></i>
                        </div>
                        <h5 className="fw-bold m-0">{stats.week.topCampaign}</h5>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted small fw-medium text-uppercase tracking-wider">Top Article Clicked</span>
                            <i className="fa-solid fa-newspaper text-success"></i>
                        </div>
                        <h5 className="fw-bold m-0">{stats.week.topArticle}</h5>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted small fw-medium text-uppercase tracking-wider">Top Lead Magnet</span>
                            <i className="fa-solid fa-magnet text-info"></i>
                        </div>
                        <h5 className="fw-bold m-0">{stats.week.topMagnet}</h5>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-light text-center h-100 d-flex flex-column justify-content-center">
                        <span className="text-muted small fw-bold text-uppercase tracking-wider mb-2 d-block">Click-Through Rate (CTR)</span>
                        <h1 className="fw-bold text-dark m-0 display-5">{stats.week.ctr}</h1>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-primary bg-opacity-10 text-center h-100 d-flex flex-column justify-content-center">
                        <span className="text-primary small fw-bold text-uppercase tracking-wider mb-2 d-block">Overall Conversion Rate</span>
                        <h1 className="fw-bold text-primary m-0 display-4">{stats.week.conversionRate}</h1>
                    </div>
                </div>
            </div>
        </div>
    )
}
