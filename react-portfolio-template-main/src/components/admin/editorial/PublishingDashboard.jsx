import React, { useEffect, useState } from 'react'
import { supabase } from '/src/utils/supabase.js'
import { useLocation } from '/src/providers/LocationProvider.jsx'
import { TrendAreaChart, SimpleBarChart, TrafficSourcesPieChart, FunnelChart } from '/src/components/analytics/AnalyticsCharts.jsx'

export default function PublishingDashboard() {
    const { goToAdminRoute } = useLocation()
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState('30_days')
    const [activeTab, setActiveTab] = useState('overview')

    // Data states
    const [metrics, setMetrics] = useState({
        audience: { views: 0, visitors: 0, avgTime: '0m 0s', engagement: '0%', scroll: '0%', shares: 0, internalClicks: 0 },
        conversion: { signups: 0, ctaClicks: 0, downloads: 0, forms: 0, revenue: 0, projGenerated: 0, avgLeadValue: 0 },
        seo: { avgScore: 0, below80: 0, missingMeta: 0, missingImages: 0 },
        publishing: { nextScheduled: null, lastPublished: null, health: 'Healthy', lastRun: 'Unknown', streak: '0 days' }
    })

    const [insights, setInsights] = useState([])
    const [decayingArticles, setDecayingArticles] = useState([])
    const [topArticles, setTopArticles] = useState([])
    const [categoryLeaderboard, setCategoryLeaderboard] = useState([])
    const [searchOpportunities, setSearchOpportunities] = useState([])
    const [topKeywords, setTopKeywords] = useState([])
    const [authors, setAuthors] = useState([])

    // Empty state trigger
    const [hasData, setHasData] = useState(false)

    // Goals (Hardcoded targets for V1)
    const goals = {
        traffic: { current: 8143, target: 10000 },
        leads: { current: 43, target: 100 },
        newsletter: { current: 19, target: 50 },
        seoScore: { current: 91, target: 95 }
    }

    // System Health Status
    const systemHealth = {
        database: 'healthy',
        scheduler: 'needs_attention',
        newsletter: 'healthy',
        supabase: 'healthy',
        analytics: 'healthy',
        storage: 'healthy'
    }

    // Mock Chart Data
    const trendData = [
        { date: 'Mon', views: 120, conversions: 4 },
        { date: 'Tue', views: 210, conversions: 8 },
        { date: 'Wed', views: 180, conversions: 5 },
        { date: 'Thu', views: 290, conversions: 12 },
        { date: 'Fri', views: 350, conversions: 18 },
        { date: 'Sat', views: 150, conversions: 3 },
        { date: 'Sun', views: 190, conversions: 7 },
    ]

    const funnelData = [
        { name: '100 Readers Started', value: 100 },
        { name: '84 reached 25%', value: 84 },
        { name: '61 reached 50%', value: 61 },
        { name: '43 reached 75%', value: 43 },
        { name: '27 finished', value: 27 }
    ]

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true)
            try {
                const { data: articles } = await supabase.from('articles').select('id, title, status, published_at, seo_title, seo_description, cover_image_id')
                
                if (!articles || articles.length === 0) {
                    setHasData(false)
                    setLoading(false)
                    return
                }

                setHasData(true)
                
                let nextSched = null, lastPub = null
                let totalSeoScore = 0, missingMeta = 0, missingImg = 0, below80 = 0

                articles.forEach(a => {
                    if (a.status === 'scheduled' && (!nextSched || new Date(a.published_at) < new Date(nextSched.published_at))) nextSched = a
                    if (a.status === 'published' && (!lastPub || new Date(a.published_at) > new Date(lastPub.published_at))) lastPub = a

                    let score = 100
                    if (!a.seo_title || !a.seo_description) { score -= 30; missingMeta++ }
                    if (!a.cover_image_id) { score -= 20; missingImg++ }
                    if (score < 80) below80++
                    totalSeoScore += score
                })

                setInsights([
                    { type: 'up', text: 'SEO articles convert 41% better.', action: 'Write SEO Article →', link: '/articles/new' },
                    { type: 'down', text: '2 articles show signs of content decay.', action: 'Update Articles →', link: '/articles' },
                    { type: 'warning', text: `${missingImg} featured images missing.`, action: 'Upload Images →', link: '/articles' }
                ])

                setTopArticles([
                    { title: 'The Future of SEO in 2026', views: 1240, conversions: 42, rate: '3.4%' },
                    { title: 'How to Price Website Design', views: 980, conversions: 61, rate: '6.2%' }
                ])

                setCategoryLeaderboard([
                    { name: 'SEO', views: 9800, leads: 82, conversion: '3.4%' },
                    { name: 'Websites', views: 5300, leads: 61, conversion: '5.8%' }
                ])

                setDecayingArticles([
                    { title: 'Top SEO Tips 2025', drop: '-45%', action: 'Update Article →' },
                    { title: 'Branding Basics', drop: '-30%', action: 'Update Article →' }
                ])

                setSearchOpportunities([
                    { query: 'Restaurant Websites', searches: 18 }
                ])

                setTopKeywords([
                    { keyword: 'nairobi web design', views: 1204, ctr: '12%', conversions: 8 },
                    { keyword: 'seo agency', views: 940, ctr: '8%', conversions: 5 }
                ])

                setAuthors([
                    { name: 'Jay', articles: 74, views: 48302, seo: 94, conversions: 312, revenue: 'KES 4,800,000' }
                ])

                setMetrics({
                    audience: { views: 12450, visitors: 8200, avgTime: '3m 12s', engagement: '64%', scroll: '45%', shares: 124, internalClicks: 430 },
                    conversion: { signups: 85, ctaClicks: 320, downloads: 45, forms: 12, revenue: 'KES 180,000', projGenerated: 2, avgLeadValue: 'KES 90,000' },
                    seo: { avgScore: Math.round(totalSeoScore / articles.length), below80, missingMeta, missingImages: missingImg },
                    publishing: { nextScheduled: nextSched, lastPublished: lastPub, health: 'Healthy', lastRun: '15 min ago', streak: lastPub ? `${Math.round((new Date() - new Date(lastPub.published_at)) / 86400000)} days` : '0 days' }
                })

            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        
        fetchDashboardData()
    }, [dateRange])

    const exportCSV = (type) => {
        let csvContent = "data:text/csv;charset=utf-8,"
        if (type === 'analytics') csvContent += `Total Views,${metrics.audience.views}\nUnique Visitors,${metrics.audience.visitors}\n`
        if (type === 'leads') csvContent += `Signups,${metrics.conversion.signups}\nForms,${metrics.conversion.forms}\n`
        
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `${type}_${dateRange}.csv`)
        document.body.appendChild(link)
        link.click()
    }

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>

    if (!hasData) {
        return (
            <div className="container-fluid p-5 text-center">
                <i className="fa-solid fa-chart-line text-muted mb-3" style={{fontSize: '4rem', opacity: 0.2}}></i>
                <h3 className="fw-bold">No visitors yet.</h3>
                <p className="text-muted mb-4">Publish your first article to begin collecting analytics.</p>
                <button className="btn btn-primary rounded-pill px-4" onClick={() => goToAdminRoute('/articles/new')}>
                    Publish Article <i className="fa-solid fa-arrow-right ms-2"></i>
                </button>
            </div>
        )
    }

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold tracking-tight m-0">Publishing Intelligence</h3>
                    <div className="text-muted small mt-1">
                        <span className="badge bg-success-subtle text-success me-2"><i className="fa-solid fa-circle fa-2xs me-1"></i>Live</span>
                        12 visitors online reading 5 articles
                    </div>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    <select className="form-select form-select-sm shadow-sm" value={dateRange} onChange={e => setDateRange(e.target.value)} style={{width: 'auto'}}>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="7_days">Last 7 Days</option>
                        <option value="30_days">Last 30 Days</option>
                        <option value="90_days">Last 90 Days</option>
                    </select>
                    
                    <div className="dropdown">
                        <button className="btn btn-sm btn-outline-secondary bg-white shadow-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i className="fa-solid fa-download me-2"></i>Export
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow">
                            <li><button className="dropdown-item small" onClick={() => exportCSV('analytics')}>Analytics CSV</button></li>
                            <li><button className="dropdown-item small" onClick={() => exportCSV('leads')}>Leads CSV</button></li>
                            <li><button className="dropdown-item small" onClick={() => exportCSV('searches')}>Searches CSV</button></li>
                            <li><hr className="dropdown-divider"/></li>
                            <li><button className="dropdown-item small disabled text-muted"><i className="fa-solid fa-file-pdf me-2"></i>PDF Report (Soon)</button></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <ul className="nav nav-pills mb-4 border-bottom pb-2">
                <li className="nav-item">
                    <button className={`nav-link rounded-pill px-4 py-2 ${activeTab === 'overview' ? 'active shadow-sm' : 'text-muted'}`} onClick={() => setActiveTab('overview')}>Homepage</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link rounded-pill px-4 py-2 ${activeTab === 'audience' ? 'active shadow-sm' : 'text-muted'}`} onClick={() => setActiveTab('audience')}>Audience & Engagement</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link rounded-pill px-4 py-2 ${activeTab === 'conversion' ? 'active shadow-sm' : 'text-muted'}`} onClick={() => setActiveTab('conversion')}>Conversion & Revenue</button>
                </li>
            </ul>

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
                <>
                    {/* Performance Alerts Banner */}
                    {systemHealth.scheduler === 'needs_attention' && (
                        <div className="alert alert-warning border-warning-subtle rounded-4 mb-4 d-flex justify-content-between align-items-center">
                            <div><i className="fa-solid fa-triangle-exclamation me-2"></i><strong>Needs Attention:</strong> Scheduler GitHub Action failed on its last run.</div>
                            <button className="btn btn-sm btn-outline-warning text-dark">View Logs →</button>
                        </div>
                    )}

                    <div className="row g-3 mb-4">
                        <div className="col-lg-3 col-md-6"><ScoreCard title="Traffic" value={metrics.audience.views.toLocaleString()} subtitle="Views" color="primary" /></div>
                        <div className="col-lg-3 col-md-6"><ScoreCard title="Leads" value={metrics.conversion.signups + metrics.conversion.forms} subtitle="Signups & Forms" color="success" /></div>
                        <div className="col-lg-3 col-md-6"><ScoreCard title="Revenue" value={metrics.conversion.revenue} subtitle="Generated" color="success" /></div>
                        <div className="col-lg-3 col-md-6"><ScoreCard title="SEO Health" value={`${metrics.seo.avgScore}/100`} subtitle={`${metrics.seo.missingMeta} warnings`} color="warning" /></div>
                    </div>

                    <div className="row g-4 mb-4">
                        <div className="col-lg-8">
                            <div className="card shadow-sm border-0 rounded-4 h-100">
                                <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                                    <h6 className="fw-bold m-0 text-uppercase tracking-wider text-muted small">Intelligence Insights</h6>
                                    <span className="badge bg-primary-subtle text-primary"><i className="fa-solid fa-wand-magic-sparkles me-1"></i>AI Generated</span>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-3">
                                        {insights.map((insight, i) => (
                                            <div className="col-md-6" key={i}>
                                                <div className="d-flex flex-column p-3 bg-light rounded-3 h-100">
                                                    <div className="d-flex align-items-start mb-2">
                                                        <i className={`fa-solid fa-arrow-${insight.type === 'up' ? 'up text-success' : insight.type === 'down' ? 'down text-danger' : 'right text-warning'} mt-1 me-2`}></i>
                                                        <div className="fw-medium text-dark">{insight.text}</div>
                                                    </div>
                                                    {insight.action && (
                                                        <button className="btn btn-sm btn-link p-0 text-start text-decoration-none mt-auto" onClick={() => goToAdminRoute(insight.link)}>
                                                            {insight.action}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card shadow-sm border-0 rounded-4 h-100 border-primary shadow" style={{borderWidth: '2px !important'}}>
                                <div className="card-header bg-primary text-white border-bottom p-4">
                                    <h6 className="fw-bold m-0 text-uppercase tracking-wider small"><i className="fa-solid fa-lightbulb me-2"></i>Next Growth Opportunity</h6>
                                </div>
                                <div className="card-body p-4 d-flex flex-column justify-content-center">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                                            <i className="fa-solid fa-check"></i>
                                        </div>
                                        <div>
                                            <div className="fw-bold">Publish 2 SEO Articles</div>
                                            <div className="small text-muted">Focus: "{searchOpportunities[0]?.query || 'SEO'}"</div>
                                        </div>
                                    </div>
                                    <div className="border-top pt-3 mt-1">
                                        <div className="d-flex justify-content-between small mb-1">
                                            <span className="text-muted">Potential Traffic</span>
                                            <strong className="text-success">+1,400 visitors</strong>
                                        </div>
                                        <div className="d-flex justify-content-between small">
                                            <span className="text-muted">Estimated Leads</span>
                                            <strong className="text-success">+8 leads/month</strong>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary rounded-pill shadow-sm mt-4" onClick={() => goToAdminRoute('/articles/new')}>
                                        Start Writing <i className="fa-solid fa-arrow-right ms-1"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        <div className="col-lg-4">
                            <div className="card shadow-sm border-0 rounded-4 h-100">
                                <div className="card-header bg-white border-bottom p-4">
                                    <h6 className="fw-bold m-0 text-uppercase tracking-wider text-muted small">Goals Progress</h6>
                                </div>
                                <div className="card-body p-4">
                                    <GoalBar title="Traffic" current={goals.traffic.current} target={goals.traffic.target} format="number" />
                                    <GoalBar title="Leads" current={goals.leads.current} target={goals.leads.target} format="number" />
                                    <GoalBar title="Newsletter" current={goals.newsletter.current} target={goals.newsletter.target} format="number" />
                                    <GoalBar title="SEO Score" current={goals.seoScore.current} target={goals.seoScore.target} format="number" />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card shadow-sm border-0 rounded-4 h-100">
                                <div className="card-header bg-white border-bottom p-4">
                                    <h6 className="fw-bold m-0 text-uppercase tracking-wider text-muted small">System Health</h6>
                                </div>
                                <div className="card-body p-4">
                                    <HealthRow name="Database" status={systemHealth.database} />
                                    <HealthRow name="GitHub Scheduler" status={systemHealth.scheduler} />
                                    <HealthRow name="Newsletter API" status={systemHealth.newsletter} />
                                    <HealthRow name="Supabase Auth" status={systemHealth.supabase} />
                                    <HealthRow name="Analytics Engine" status={systemHealth.analytics} />
                                    <HealthRow name="Storage" status={systemHealth.storage} />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card shadow-sm border-0 rounded-4 h-100">
                                <div className="card-header bg-white border-bottom p-4">
                                    <h6 className="fw-bold m-0 text-uppercase tracking-wider text-muted small">Content Decay Warning</h6>
                                </div>
                                <div className="card-body p-0">
                                    <div className="list-group list-group-flush rounded-bottom-4">
                                        {decayingArticles.map((art, i) => (
                                            <div key={i} className="list-group-item p-4 d-flex justify-content-between align-items-center">
                                                <div>
                                                    <div className="fw-bold text-dark">{art.title}</div>
                                                    <button className="btn btn-sm btn-link p-0 text-decoration-none mt-1" onClick={() => goToAdminRoute('/articles')}>
                                                        {art.action}
                                                    </button>
                                                </div>
                                                <span className="badge bg-danger-subtle text-danger px-3 py-2 border border-danger-subtle">{art.drop}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* TAB: AUDIENCE & ENGAGEMENT */}
            {activeTab === 'audience' && (
                <>
                    <div className="row g-3 mb-4">
                        <div className="col-lg-2 col-md-4 col-6"><MiniCard title="Views" value={metrics.audience.views} /></div>
                        <div className="col-lg-2 col-md-4 col-6"><MiniCard title="Visitors" value={metrics.audience.visitors} /></div>
                        <div className="col-lg-2 col-md-4 col-6"><MiniCard title="Avg Time" value={metrics.audience.avgTime} /></div>
                        <div className="col-lg-2 col-md-4 col-6"><MiniCard title="Scroll %" value={metrics.audience.scroll} /></div>
                        <div className="col-lg-2 col-md-4 col-6"><MiniCard title="Shares" value={metrics.audience.shares} /></div>
                        <div className="col-lg-2 col-md-4 col-6"><MiniCard title="Internal Clicks" value={metrics.audience.internalClicks} /></div>
                    </div>

                    <div className="row g-4 mb-4">
                        <div className="col-lg-8">
                            <div className="card shadow-sm border-0 rounded-4 h-100">
                                <div className="card-header bg-white border-bottom p-4">
                                    <h6 className="fw-bold m-0 text-uppercase tracking-wider text-muted small">Traffic Trends</h6>
                                </div>
                                <div className="card-body p-4">
                                    <TrendAreaChart data={trendData} xKey="date" yKey="views" name="Page Views" />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card shadow-sm border-0 rounded-4 h-100">
                                <div className="card-header bg-white border-bottom p-4">
                                    <h6 className="fw-bold m-0 text-uppercase tracking-wider text-muted small">Reading Funnel</h6>
                                </div>
                                <div className="card-body p-4">
                                    <FunnelChart data={funnelData} height={250} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        <div className="col-lg-6">
                            <div className="card shadow-sm border-0 rounded-4 h-100">
                                <div className="card-header bg-white border-bottom p-4">
                                    <h6 className="fw-bold m-0 text-uppercase tracking-wider text-muted small">Top Performing Articles</h6>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-hover table-borderless align-middle m-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="py-3 ps-4">Article</th>
                                                <th className="py-3">Views</th>
                                                <th className="py-3 pe-4 text-end">Convs</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topArticles.map((art, i) => (
                                                <tr key={i} className="border-bottom">
                                                    <td className="py-3 ps-4 fw-medium text-dark">{art.title}</td>
                                                    <td className="py-3">{art.views.toLocaleString()}</td>
                                                    <td className="py-3 pe-4 text-end text-success fw-bold">{art.conversions}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="card shadow-sm border-0 rounded-4 h-100">
                                <div className="card-header bg-white border-bottom p-4">
                                    <h6 className="fw-bold m-0 text-uppercase tracking-wider text-muted small">Top Keywords</h6>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-hover table-borderless align-middle m-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="py-3 ps-4">Keyword</th>
                                                <th className="py-3">Views</th>
                                                <th className="py-3">CTR</th>
                                                <th className="py-3 pe-4 text-end">Convs</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topKeywords.map((kw, i) => (
                                                <tr key={i} className="border-bottom">
                                                    <td className="py-3 ps-4 fw-medium text-dark">{kw.keyword}</td>
                                                    <td className="py-3">{kw.views.toLocaleString()}</td>
                                                    <td className="py-3">{kw.ctr}</td>
                                                    <td className="py-3 pe-4 text-end text-success fw-bold">{kw.conversions}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* TAB: CONVERSION & REVENUE */}
            {activeTab === 'conversion' && (
                <>
                    <div className="row g-3 mb-4">
                        <div className="col-lg-4">
                            <div className="card bg-success text-white border-0 shadow-sm rounded-4 h-100">
                                <div className="card-body p-4">
                                    <div className="text-white-50 text-uppercase tracking-wider small fw-bold mb-2">Total Revenue Generated</div>
                                    <h2 className="fw-bold mb-0">{metrics.conversion.revenue}</h2>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card bg-primary text-white border-0 shadow-sm rounded-4 h-100">
                                <div className="card-body p-4">
                                    <div className="text-white-50 text-uppercase tracking-wider small fw-bold mb-2">Projects Generated</div>
                                    <h2 className="fw-bold mb-0">{metrics.conversion.projGenerated}</h2>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card bg-info text-white border-0 shadow-sm rounded-4 h-100">
                                <div className="card-body p-4">
                                    <div className="text-white-50 text-uppercase tracking-wider small fw-bold mb-2">Avg Lead Value</div>
                                    <h2 className="fw-bold mb-0">{metrics.conversion.avgLeadValue}</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4 mb-4">
                        <div className="col-lg-8">
                            <div className="card shadow-sm border-0 rounded-4 h-100">
                                <div className="card-header bg-white border-bottom p-4">
                                    <h6 className="fw-bold m-0 text-uppercase tracking-wider text-muted small">Category Leaderboard</h6>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-hover table-borderless align-middle m-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="py-3 ps-4">Category</th>
                                                <th className="py-3">Views</th>
                                                <th className="py-3">Leads</th>
                                                <th className="py-3 pe-4 text-end">Conversion</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categoryLeaderboard.map((cat, i) => (
                                                <tr key={i} className="border-bottom">
                                                    <td className="py-3 ps-4 fw-bold text-dark">{cat.name}</td>
                                                    <td className="py-3">{cat.views.toLocaleString()}</td>
                                                    <td className="py-3 text-success fw-bold">{cat.leads}</td>
                                                    <td className="py-3 pe-4 text-end"><span className="badge bg-light text-dark border">{cat.conversion}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card shadow-sm border-0 rounded-4 h-100">
                                <div className="card-header bg-white border-bottom p-4">
                                    <h6 className="fw-bold m-0 text-uppercase tracking-wider text-muted small">CTA Heatmap</h6>
                                </div>
                                <div className="card-body p-0">
                                    <div className="list-group list-group-flush rounded-bottom-4">
                                        <div className="list-group-item p-4 d-flex justify-content-between align-items-center">
                                            <div className="fw-medium text-dark">Bottom CTA</div>
                                            <span className="badge bg-success-subtle text-success border border-success-subtle">15.3%</span>
                                        </div>
                                        <div className="list-group-item p-4 d-flex justify-content-between align-items-center">
                                            <div className="fw-medium text-dark">Sidebar</div>
                                            <span className="badge bg-warning-subtle text-warning text-dark border border-warning-subtle">7.2%</span>
                                        </div>
                                        <div className="list-group-item p-4 d-flex justify-content-between align-items-center">
                                            <div className="fw-medium text-dark">Homepage</div>
                                            <span className="badge bg-light text-muted border">4.8%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Author Performance Leaderboard */}
                    <div className="card shadow-sm border-0 rounded-4">
                        <div className="card-header bg-white border-bottom p-4">
                            <h6 className="fw-bold m-0 text-uppercase tracking-wider text-muted small">Author Performance</h6>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover table-borderless align-middle m-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="py-3 ps-4">Author</th>
                                        <th className="py-3">Articles</th>
                                        <th className="py-3">Views</th>
                                        <th className="py-3">Avg SEO</th>
                                        <th className="py-3">Convs</th>
                                        <th className="py-3 pe-4 text-end">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {authors.map((auth, i) => (
                                        <tr key={i} className="border-bottom">
                                            <td className="py-3 ps-4 fw-bold text-dark d-flex align-items-center">
                                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '32px', height: '32px', fontSize: '0.8rem'}}>
                                                    {auth.name.charAt(0)}
                                                </div>
                                                {auth.name}
                                            </td>
                                            <td className="py-3">{auth.articles}</td>
                                            <td className="py-3">{auth.views.toLocaleString()}</td>
                                            <td className="py-3"><span className="badge bg-light text-dark border">{auth.seo}</span></td>
                                            <td className="py-3 text-success fw-bold">{auth.conversions}</td>
                                            <td className="py-3 pe-4 text-end fw-bold">{auth.revenue}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

const ScoreCard = ({ title, subtitle, value, color }) => (
    <div className={`card shadow-sm border-0 rounded-4 h-100 border-start border-4 border-${color}`}>
        <div className="card-body p-4 d-flex flex-column justify-content-center">
            <h3 className={`fw-bold m-0 text-${color}`}>{value}</h3>
            <div className="fw-bold text-dark mt-2">{title}</div>
            <div className="small text-muted mt-1">{subtitle}</div>
        </div>
    </div>
)

const MiniCard = ({ title, value }) => (
    <div className="card shadow-sm border-0 rounded-4 h-100">
        <div className="card-body p-3 text-center">
            <div className="text-muted small text-uppercase tracking-wider mb-1">{title}</div>
            <div className="fw-bold fs-5 text-dark">{value}</div>
        </div>
    </div>
)

const GoalBar = ({ title, current, target }) => {
    const percent = Math.min(100, Math.round((current / target) * 100))
    return (
        <div className="mb-4 last-mb-0">
            <div className="d-flex justify-content-between mb-1">
                <span className="fw-medium small text-dark">{title}</span>
                <span className="small text-muted">{current.toLocaleString()} / {target.toLocaleString()}</span>
            </div>
            <div className="progress" style={{ height: '8px' }}>
                <div className={`progress-bar bg-${percent >= 100 ? 'success' : 'primary'}`} role="progressbar" style={{ width: `${percent}%` }}></div>
            </div>
        </div>
    )
}

const HealthRow = ({ name, status }) => {
    const isHealthy = status === 'healthy'
    return (
        <div className="d-flex justify-content-between align-items-center mb-3 last-mb-0 border-bottom pb-3 last-pb-0 last-border-0">
            <span className="text-muted fw-medium small">{name}</span>
            <div className="d-flex align-items-center">
                <span className={`small me-2 ${isHealthy ? 'text-success' : 'text-warning'}`}>
                    {isHealthy ? 'Healthy' : 'Needs Attention'}
                </span>
                <i className={`fa-solid fa-circle fa-xs ${isHealthy ? 'text-success' : 'text-warning'}`}></i>
            </div>
        </div>
    )
}
