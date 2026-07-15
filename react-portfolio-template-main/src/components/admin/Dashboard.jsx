import React, { useState } from 'react'
import { useAuth } from '/src/providers/AuthProvider.jsx'
import { useLocation } from '/src/providers/LocationProvider.jsx'

export default function Dashboard() {
    const { user } = useAuth()
    const { goToAdminRoute } = useLocation()
    const [trafficView, setTrafficView] = useState('visitors')

    // Mock data for the dashboard
    const stats = [
        { label: 'ARTICLES', value: '142', trend: '+12%', trendUp: true, lastUpdated: '3m ago', icon: 'pi-file' },
        { label: 'VIEWS (30D)', value: '45.2K', trend: '+8%', trendUp: true, lastUpdated: '12m ago', icon: 'pi-eye' },
        { label: 'LEADS', value: '840', trend: '+24%', trendUp: true, lastUpdated: '1h ago', icon: 'pi-users' },
        { label: 'SEO HEALTH', value: '92%', trend: '-1%', trendUp: false, lastUpdated: '1d ago', icon: 'pi-chart-bar' },
    ]

    return (
        <div className="d-flex flex-column" style={{ gap: 'var(--admin-gap-section)' }}>
            {/* Header (Page Title Area) */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end" style={{ gap: 'var(--admin-gap-component)' }}>
                <div>
                    <h1 className="admin-page-title mb-2">Overview</h1>
                    <p className="admin-body-text mb-0">Project Atlas performance and system status.</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <button className="admin-btn admin-btn-primary">
                        <i className="pi pi-plus"></i>
                        New Article
                    </button>
                </div>
            </div>

            {/* Row 1: Statistics Cards */}
            <div className="row g-4 animation-slide-up" style={{ animationDelay: '50ms' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="col-12 col-sm-6 col-xl-3">
                        <div className="admin-card h-100 position-relative overflow-hidden animation-lift" style={{ padding: 'var(--admin-gap-lg)' }}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <span className="admin-small-text fw-medium text-muted text-uppercase" style={{ letterSpacing: '0.5px' }}>{stat.label}</span>
                                <div className={`d-flex align-items-center gap-1 rounded px-2 py-1 ${stat.trendUp ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`} style={{ fontSize: '12px', fontWeight: '600' }}>
                                    <i className={`pi ${stat.trendUp ? 'pi-arrow-up-right' : 'pi-arrow-down-right'}`} style={{ fontSize: '10px' }}></i>
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="d-flex flex-column gap-2 mb-4">
                                <h2 className="admin-stat-text m-0">{stat.value}</h2>
                                {/* Mini Sparkline underneath metric */}
                                <div className="w-100 mt-2" style={{ height: '32px', position: 'relative' }}>
                                    <svg width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                                        <path d={stat.trendUp ? "M0,32 C20,20 40,32 60,10 S80,20 100,0" : "M0,0 C20,10 40,0 60,20 S80,10 100,32"} 
                                              fill="none" 
                                              stroke={stat.trendUp ? "var(--admin-color-success)" : "var(--admin-color-danger)"} 
                                              strokeWidth="2" 
                                              vectorEffect="non-scaling-stroke" />
                                        {/* Optional gradient fill beneath the line for extra polish */}
                                        <path d={stat.trendUp ? "M0,32 C20,20 40,32 60,10 S80,20 100,0 L100,32 L0,32 Z" : "M0,0 C20,10 40,0 60,20 S80,10 100,32 L100,32 L0,32 Z"}
                                              fill={stat.trendUp ? "url(#grad-success)" : "url(#grad-danger)"}
                                              style={{ opacity: 0.1 }} />
                                        <defs>
                                            <linearGradient id="grad-success" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--admin-color-success)"></stop>
                                                <stop offset="100%" stopColor="transparent"></stop>
                                            </linearGradient>
                                            <linearGradient id="grad-danger" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--admin-color-danger)"></stop>
                                                <stop offset="100%" stopColor="transparent"></stop>
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            </div>

                            <div className="admin-meta-text d-flex justify-content-between align-items-center mt-auto">
                                <span className="opacity-75">Updated {stat.lastUpdated}</span>
                                <i className={`pi ${stat.icon} text-muted opacity-50`}></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Row 2: Performance & Queue */}
            <div className="row g-4">
                <div className="col-xl-8">
                    <div className="admin-card h-100 p-0">
                        <div className="p-4 border-bottom border-light d-flex justify-content-between align-items-center">
                            <h5 className="admin-card-title mb-0">Traffic Overview</h5>
                            <div className="d-flex gap-2">
                                <div className="btn-group border rounded p-1" style={{ backgroundColor: 'var(--admin-bg-sidebar)' }}>
                                    {['visitors', 'sessions', 'conversions'].map(view => (
                                        <button 
                                            key={view}
                                            onClick={() => setTrafficView(view)}
                                            className={`btn btn-sm border-0 rounded px-3 py-1 fw-medium ${trafficView === view ? 'bg-white shadow-sm text-dark' : 'text-muted'}`}
                                            style={{ fontSize: '13px' }}
                                        >
                                            {view.charAt(0).toUpperCase() + view.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <button className="admin-btn admin-btn-outline admin-small-text">
                                    Last 30 Days <i className="pi pi-calendar ms-2"></i>
                                </button>
                            </div>
                        </div>
                        <div className="p-4 d-flex align-items-center justify-content-center flex-grow-1" style={{ minHeight: '360px', background: 'linear-gradient(180deg, var(--admin-bg-card) 0%, var(--admin-bg-soft) 100%)' }}>
                            <div className="text-center">
                                <div className="spinner-border text-primary opacity-25 mb-3" role="status"></div>
                                <div className="admin-small-text fw-medium">Loading high-res chart data...</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-4">
                    <div className="admin-card h-100 p-0">
                        <div className="p-4 border-bottom border-light d-flex justify-content-between align-items-center">
                            <h5 className="admin-card-title mb-0">Publishing Queue</h5>
                            <button className="btn btn-sm btn-link text-decoration-none admin-meta-text fw-medium px-0" onClick={() => goToAdminRoute('/publishing/calendar')}>View Calendar</button>
                        </div>
                        <div className="p-4 d-flex flex-column gap-4">
                            {[
                                { date: 'OCT 12', time: '10:00 AM', title: 'Advanced React Patterns', author: 'Sarah J.', status: 'Scheduled' },
                                { date: 'OCT 14', time: '02:30 PM', title: 'State Management in 2026', author: 'Mike R.', status: 'Drafting' },
                                { date: 'OCT 18', time: '09:00 AM', title: 'UI Polish Guide', author: 'Alex T.', status: 'Review' }
                            ].map((item, i) => (
                                <div key={i} className="d-flex align-items-start gap-3 position-relative">
                                    {/* Timeline line connecting items */}
                                    {i < 2 && <div className="position-absolute border-start border-2 border-light" style={{ left: '20px', top: '40px', bottom: '-20px', zIndex: 0 }}></div>}
                                    
                                    <div className="bg-light border rounded text-center d-flex flex-column justify-content-center z-1 bg-white" style={{ width: '42px', height: '42px', minWidth: '42px' }}>
                                        <div className="fw-bold" style={{ fontSize: '14px', lineHeight: '1' }}>{item.date.split(' ')[1]}</div>
                                        <div className="admin-meta-text text-uppercase" style={{ fontSize: '9px' }}>{item.date.split(' ')[0]}</div>
                                    </div>
                                    <div className="flex-grow-1 border border-light rounded p-3 transition-hover shadow-sm" style={{ backgroundColor: 'var(--admin-bg-card)' }}>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="admin-meta-text fw-bold text-muted">{item.time}</div>
                                            <span className={`badge rounded-pill ${item.status === 'Scheduled' ? 'bg-success' : item.status === 'Review' ? 'bg-warning text-dark' : 'bg-secondary'} opacity-75`} style={{ fontSize: '10px' }}>{item.status}</span>
                                        </div>
                                        <div className="fw-medium admin-small-text text-dark mb-1">{item.title}</div>
                                        <div className="admin-meta-text text-muted d-flex align-items-center gap-2">
                                            <div className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center" style={{ width: '16px', height: '16px', fontSize: '8px' }}>{item.author[0]}</div>
                                            {item.author}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 3: Content & Opportunities */}
            <div className="row g-4">
                <div className="col-xl-7">
                    <div className="admin-card h-100 p-0 overflow-hidden">
                        <div className="p-4 border-bottom border-light d-flex justify-content-between align-items-center">
                            <h5 className="admin-card-title m-0">Top Articles</h5>
                            <button className="admin-btn admin-btn-ghost admin-small-text">View All</button>
                        </div>
                        <div className="table-responsive">
                            <table className="admin-table w-100">
                                <thead>
                                    <tr>
                                        <th>Article</th>
                                        <th>Views</th>
                                        <th>SEO</th>
                                        <th>Trend</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1,2,3,4].map(i => (
                                        <tr key={i}>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="rounded bg-light border d-flex align-items-center justify-content-center" style={{ width: '48px', height: '36px' }}>
                                                        <i className="pi pi-image text-muted opacity-50"></i>
                                                    </div>
                                                    <div>
                                                        <div className="fw-medium text-dark admin-small-text">Understanding Context API {i}</div>
                                                        <div className="admin-meta-text">4 min read • Published Oct {i}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="fw-medium">12,{i}40</td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="progress w-100" style={{ height: '6px', maxWidth: '60px' }}>
                                                        <div className="progress-bar bg-success" style={{ width: '92%' }}></div>
                                                    </div>
                                                    <span className="admin-meta-text fw-bold">92</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2">↑ 5.2%</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-xl-5">
                    <div className="admin-card h-100 p-0 animation-slide-up" style={{ animationDelay: '150ms' }}>
                        <div className="p-4 border-bottom border-light d-flex justify-content-between align-items-center">
                            <h5 className="admin-card-title mb-0">AI Opportunities</h5>
                            <span className="badge text-white rounded-pill px-2 py-1" style={{ fontSize: '10px', backgroundColor: 'var(--admin-color-ai)' }}>
                                <i className="pi pi-sparkles me-1"></i>
                                3 ACTIVE
                            </span>
                        </div>
                        <div className="p-4 d-flex flex-column gap-4">
                            <div className="border border-light rounded position-relative overflow-hidden animation-lift shadow-sm bg-white p-4">
                                <div className="position-absolute top-0 start-0 w-100" style={{ height: '3px', backgroundColor: 'var(--admin-color-danger)' }}></div>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="rounded bg-danger bg-opacity-10 text-danger p-2 d-flex align-items-center justify-content-center">
                                            <i className="pi pi-bolt"></i>
                                        </div>
                                        <h6 className="fw-bold m-0 admin-small-text text-dark">Fix Orphaned Pillar Pages</h6>
                                    </div>
                                    <span className="badge bg-danger bg-opacity-10 text-danger rounded px-2 py-1 fw-bold" style={{ fontSize: '10px' }}>HIGH PRIORITY</span>
                                </div>
                                <p className="admin-meta-text text-secondary mb-3" style={{ lineHeight: '1.5' }}>3 pillar pages currently have no internal links pointing to them. Adding links will improve cluster authority.</p>
                                <div className="bg-light rounded p-3 mb-3 border d-flex justify-content-between align-items-center">
                                    <div className="d-flex flex-column gap-1">
                                        <span className="admin-meta-text text-muted text-uppercase" style={{ fontSize: '10px' }}>Impact</span>
                                        <span className="admin-small-text fw-bold text-success">+18% Traffic</span>
                                    </div>
                                    <div className="d-flex flex-column gap-1 border-start ps-3">
                                        <span className="admin-meta-text text-muted text-uppercase" style={{ fontSize: '10px' }}>Difficulty</span>
                                        <span className="admin-small-text fw-medium">Easy</span>
                                    </div>
                                    <div className="d-flex flex-column gap-1 border-start ps-3">
                                        <span className="admin-meta-text text-muted text-uppercase" style={{ fontSize: '10px' }}>Confidence</span>
                                        <span className="admin-small-text fw-medium">92%</span>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <button className="btn btn-sm btn-outline-dark px-3 py-1 bg-white shadow-sm" style={{ fontSize: '12px', borderRadius: '6px' }}>Preview Fix</button>
                                    <button className="btn btn-sm btn-dark px-3 py-1 shadow-sm" style={{ fontSize: '12px', borderRadius: '6px' }}><i className="pi pi-wrench me-1"></i> Fix Now</button>
                                </div>
                            </div>
                            
                            <div className="border border-light rounded position-relative overflow-hidden animation-lift shadow-sm bg-white p-4">
                                <div className="position-absolute top-0 start-0 w-100" style={{ height: '3px', backgroundColor: 'var(--admin-color-warning)' }}></div>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="rounded bg-warning bg-opacity-10 text-warning p-2 d-flex align-items-center justify-content-center">
                                            <i className="pi pi-refresh"></i>
                                        </div>
                                        <h6 className="fw-bold m-0 admin-small-text text-dark">Update Stale Content</h6>
                                    </div>
                                    <span className="badge bg-warning bg-opacity-10 text-warning rounded px-2 py-1 fw-bold" style={{ fontSize: '10px' }}>MEDIUM PRIORITY</span>
                                </div>
                                <p className="admin-meta-text text-secondary mb-3" style={{ lineHeight: '1.5' }}>"React Router v6" article is driving traffic but hasn't been updated in 14 months.</p>
                                <div className="bg-light rounded p-3 mb-3 border d-flex justify-content-between align-items-center">
                                    <div className="d-flex flex-column gap-1">
                                        <span className="admin-meta-text text-muted text-uppercase" style={{ fontSize: '10px' }}>Impact</span>
                                        <span className="admin-small-text fw-bold text-success">+5% Conv.</span>
                                    </div>
                                    <div className="d-flex flex-column gap-1 border-start ps-3">
                                        <span className="admin-meta-text text-muted text-uppercase" style={{ fontSize: '10px' }}>Difficulty</span>
                                        <span className="admin-small-text fw-medium">Medium</span>
                                    </div>
                                    <div className="d-flex flex-column gap-1 border-start ps-3">
                                        <span className="admin-meta-text text-muted text-uppercase" style={{ fontSize: '10px' }}>Confidence</span>
                                        <span className="admin-small-text fw-medium">85%</span>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <button className="btn btn-sm btn-outline-dark px-3 py-1 bg-white shadow-sm" style={{ fontSize: '12px', borderRadius: '6px' }}>Review Draft</button>
                                    <button className="btn btn-sm btn-dark px-3 py-1 shadow-sm" style={{ fontSize: '12px', borderRadius: '6px' }}><i className="pi pi-sparkles me-1"></i> Auto-Update</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 4: System Health */}
            <div>
                <h4 className="admin-section-title mb-4" style={{ fontSize: '20px' }}>System Health</h4>
                <div className="row g-4">
                    <div className="col-md-6 col-lg-3">
                        <div className="admin-card p-4">
                            <div className="d-flex justify-content-between mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                        <i className="pi pi-server text-success" style={{ fontSize: '14px' }}></i>
                                    </div>
                                    <h6 className="fw-bold mb-0 admin-small-text">Vercel Edge</h6>
                                </div>
                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1">Operational</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-end mt-2">
                                <div>
                                    <div className="admin-meta-text text-muted mb-1">Latency</div>
                                    <div className="fw-bold admin-small-text">24ms</div>
                                </div>
                                <div>
                                    <div className="admin-meta-text text-muted mb-1 text-end">Uptime</div>
                                    <div className="fw-bold admin-small-text">99.99%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-md-6 col-lg-3">
                        <div className="admin-card p-4">
                            <div className="d-flex justify-content-between mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                        <i className="pi pi-database text-primary" style={{ fontSize: '14px' }}></i>
                                    </div>
                                    <h6 className="fw-bold mb-0 admin-small-text">Supabase</h6>
                                </div>
                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1">Operational</span>
                            </div>
                            <div className="mt-2">
                                <div className="d-flex justify-content-between mb-1">
                                    <div className="admin-meta-text text-muted">Connections</div>
                                    <div className="admin-meta-text fw-bold">12 / 100</div>
                                </div>
                                <div className="progress" style={{ height: '4px' }}>
                                    <div className="progress-bar bg-primary" style={{ width: '12%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 col-lg-3">
                        <div className="admin-card p-4">
                            <div className="d-flex justify-content-between mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="rounded-circle bg-warning bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                        <i className="pi pi-cloud text-warning" style={{ fontSize: '14px' }}></i>
                                    </div>
                                    <h6 className="fw-bold mb-0 admin-small-text">Storage</h6>
                                </div>
                                <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-2 py-1">45% Full</span>
                            </div>
                            <div className="mt-2">
                                <div className="d-flex justify-content-between mb-1">
                                    <div className="admin-meta-text text-muted">Used</div>
                                    <div className="admin-meta-text fw-bold">45 GB / 100 GB</div>
                                </div>
                                <div className="progress" style={{ height: '4px' }}>
                                    <div className="progress-bar bg-warning" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 col-lg-3">
                        <div className="admin-card p-4 bg-dark text-white border-0">
                            <div className="d-flex justify-content-between mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <i className="pi pi-github" style={{ fontSize: '20px' }}></i>
                                    <h6 className="fw-bold mb-0 admin-small-text">CI/CD Pipeline</h6>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <div className="spinner-grow text-success" style={{ width: '8px', height: '8px' }}></div>
                                    <div className="admin-small-text fw-medium text-success">Deployed to Production</div>
                                </div>
                                <div className="admin-meta-text opacity-75">
                                    Commit <span className="text-decoration-underline" style={{ cursor: 'pointer' }}>f8a92c</span> • 2 hours ago
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

