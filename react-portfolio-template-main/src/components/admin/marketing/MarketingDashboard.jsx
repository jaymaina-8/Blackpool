import React, { useEffect, useState } from 'react'
import { supabase } from '/src/utils/supabase.js'
import CampaignsManager from './CampaignsManager.jsx'
import CTAsManager from './CTAsManager.jsx'
import LeadMagnetsManager from './LeadMagnetsManager.jsx'

export default function MarketingDashboard() {
    const [activeTab, setActiveTab] = useState('overview')
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
                
                const todayStats = { clicks: 0, signups: 0, downloads: 0, consultations: 0, impressions: 0 }
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
                            if (!ctas[title]) ctas[title] = 0
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

    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'pi-chart-line' },
        { id: 'campaigns', label: 'Campaigns', icon: 'pi-flag' },
        { id: 'magnets', label: 'Lead Magnets', icon: 'pi-magnet' },
        { id: 'ctas', label: 'CTAs', icon: 'pi-bullseye' },
        { id: 'analytics', label: 'Analytics', icon: 'pi-chart-bar' },
    ]

    const renderOverview = () => {
        if (loading) return <div className="p-5 d-flex justify-content-center"><div className="spinner-border text-primary"></div></div>

        return (
            <div className="animation-fade-in d-flex flex-column admin-gap-section">
                
                {/* Executive KPIs */}
                <div>
                    <h5 className="admin-section-title mb-4">Today's Performance</h5>
                    <div className="row g-4">
                        <div className="col-6 col-lg-3">
                            <div className="admin-card h-100 position-relative overflow-hidden">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <i className="pi pi-link text-primary"></i>
                                    <span className="admin-meta-text fw-bold text-uppercase tracking-wider">Clicks</span>
                                </div>
                                <h2 className="admin-stat-text m-0">{stats.today.clicks}</h2>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="admin-card h-100 position-relative overflow-hidden">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <i className="pi pi-envelope text-success"></i>
                                    <span className="admin-meta-text fw-bold text-uppercase tracking-wider">Signups</span>
                                </div>
                                <h2 className="admin-stat-text m-0">{stats.today.signups}</h2>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="admin-card h-100 position-relative overflow-hidden">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <i className="pi pi-download text-info"></i>
                                    <span className="admin-meta-text fw-bold text-uppercase tracking-wider">Downloads</span>
                                </div>
                                <h2 className="admin-stat-text m-0">{stats.today.downloads}</h2>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="admin-card h-100 position-relative overflow-hidden">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <i className="pi pi-eye text-warning"></i>
                                    <span className="admin-meta-text fw-bold text-uppercase tracking-wider">Impressions</span>
                                </div>
                                <h2 className="admin-stat-text m-0">{stats.today.impressions}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conversion Funnel & Rates */}
                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="admin-card h-100">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="admin-card-title m-0">Conversion Funnel</h5>
                                <button className="admin-btn admin-btn-ghost admin-small-text px-2 py-1">Last 7 Days <i className="pi pi-angle-down"></i></button>
                            </div>
                            <div className="bg-light rounded border d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                                <div className="text-center opacity-75">
                                    <i className="pi pi-filter text-muted mb-3" style={{ fontSize: '2.5rem' }}></i>
                                    <div className="admin-small-text fw-medium">Funnel Visualization Active</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 d-flex flex-column admin-gap-card">
                        <div className="admin-card text-center py-5 h-100 d-flex flex-column justify-content-center border-0 shadow-sm" style={{ backgroundColor: 'var(--admin-color-primary)', color: 'var(--admin-bg-card)' }}>
                            <span className="admin-meta-text text-uppercase tracking-wider mb-2 text-white opacity-75">Overall Conversion Rate</span>
                            <h1 className="fw-bold m-0 display-4 text-white">{stats.week.conversionRate}</h1>
                        </div>
                        <div className="admin-card text-center py-4 border-0" style={{ backgroundColor: 'var(--admin-bg-sidebar)' }}>
                            <span className="admin-meta-text text-uppercase tracking-wider mb-2 text-dark">Click-Through Rate (CTR)</span>
                            <h3 className="fw-bold text-dark m-0">{stats.week.ctr}</h3>
                        </div>
                    </div>
                </div>

                {/* Top Performers */}
                <div>
                    <h5 className="admin-section-title mb-4">Top Performers</h5>
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-3">
                            <div className="admin-card h-100">
                                <span className="admin-meta-text text-uppercase tracking-wider mb-2 text-muted">Top CTA</span>
                                <h6 className="fw-bold m-0 text-dark text-truncate" title={stats.week.topCta}>{stats.week.topCta}</h6>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="admin-card h-100">
                                <span className="admin-meta-text text-uppercase tracking-wider mb-2 text-muted">Worst CTA</span>
                                <h6 className="fw-medium m-0 text-danger text-truncate" title={stats.week.worstCta}>{stats.week.worstCta}</h6>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="admin-card h-100">
                                <span className="admin-meta-text text-uppercase tracking-wider mb-2 text-muted">Top Campaign</span>
                                <h6 className="fw-bold m-0 text-dark text-truncate" title={stats.week.topCampaign}>{stats.week.topCampaign}</h6>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="admin-card h-100">
                                <span className="admin-meta-text text-uppercase tracking-wider mb-2 text-muted">Top Lead Magnet</span>
                                <h6 className="fw-bold m-0 text-dark text-truncate" title={stats.week.topMagnet}>{stats.week.topMagnet}</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverview()
            case 'campaigns':
                return <div className="animation-fade-in"><CampaignsManager /></div>
            case 'magnets':
                return <div className="animation-fade-in"><LeadMagnetsManager /></div>
            case 'ctas':
                return <div className="animation-fade-in"><CTAsManager /></div>
            case 'analytics':
                return (
                    <div className="admin-card text-center p-5 animation-fade-in">
                        <i className="pi pi-chart-line text-muted mb-3" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                        <h4 className="fw-bold">Detailed Analytics</h4>
                        <p className="text-muted max-w-md mx-auto">
                            Advanced reporting and funnel visualization will be available in a future update.
                        </p>
                    </div>
                )
            default:
                return renderOverview()
        }
    }

    return (
        <div className="d-flex flex-column h-100" style={{ gap: 'var(--admin-gap-md)' }}>
            <div className="mb-2">
                <h1 className="admin-page-title mb-2">Marketing</h1>
                <p className="admin-body-text mb-0">Manage campaigns, track conversions, and optimize funnels.</p>
            </div>

            {/* Tabs */}
            <div className="border-bottom border-light mb-4">
                <ul className="nav nav-tabs admin-tabs border-0 gap-1">
                    {tabs.map(tab => (
                        <li className="nav-item" key={tab.id}>
                            <button 
                                className={`nav-link border-0 bg-transparent py-3 px-4 fw-medium text-muted d-flex align-items-center gap-2 ${activeTab === tab.id ? 'active text-primary border-bottom border-2 border-primary' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                                style={{ borderRadius: 0, marginBottom: '-1px' }}
                            >
                                <i className={`pi ${tab.icon}`}></i> {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Content */}
            <div className="mt-2">
                {renderContent()}
            </div>
        </div>
    )
}
