import React, { useEffect, useState } from 'react'
import { supabase } from '/src/utils/supabase.js'
import { FunnelChart } from '/src/components/analytics/AnalyticsCharts.jsx'

export default function ArticleAnalytics({ articleId, onClose }) {
    const [metrics, setMetrics] = useState({
        views: 0,
        unique: 0,
        readingTime: '0m 0s',
        signups: 0,
        ctaClicks: 0,
        downloads: 0
    })
    
    const [funnelData, setFunnelData] = useState([
        { name: '100 Readers Started', value: 100 },
        { name: '80 reached 25%', value: 80 },
        { name: '60 reached 50%', value: 60 },
        { name: '40 reached 75%', value: 40 },
        { name: '20 finished', value: 20 }
    ])

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!articleId) return

        const fetchAnalytics = async () => {
            setLoading(true)
            try {
                // In a real app, query 'analytics_events' where article_id = articleId
                // For now, mock data as tables are fresh
                setMetrics({
                    views: Math.floor(Math.random() * 5000),
                    unique: Math.floor(Math.random() * 3000),
                    readingTime: '4m 12s',
                    signups: Math.floor(Math.random() * 50),
                    ctaClicks: Math.floor(Math.random() * 100),
                    downloads: Math.floor(Math.random() * 20)
                })

                const val25 = Math.floor(Math.random() * 20 + 70)
                const val50 = Math.floor(Math.random() * 20 + 50)
                const val75 = Math.floor(Math.random() * 20 + 30)
                const val100 = Math.floor(Math.random() * 20 + 10)

                setFunnelData([
                    { name: '100 Readers Started', value: 100 },
                    { name: `${val25} reached 25%`, value: val25 },
                    { name: `${val50} reached 50%`, value: val50 },
                    { name: `${val75} reached 75%`, value: val75 },
                    { name: `${val100} finished`, value: val100 }
                ])
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [articleId])

    return (
        <div className="offcanvas offcanvas-end show" style={{ width: '500px', visibility: 'visible', zIndex: 1050 }} tabIndex="-1">
            <div className="offcanvas-header border-bottom">
                <h5 className="offcanvas-title fw-bold">Article Insights</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="offcanvas-body bg-light p-4">
                {loading ? (
                    <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : (
                    <>
                        {/* Traffic Overview */}
                        <div className="card shadow-sm border-0 mb-4 rounded-4">
                            <div className="card-header bg-white fw-bold py-3">Traffic</div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-6">
                                        <div className="text-muted small">Views</div>
                                        <div className="fw-bold fs-4 text-primary">{metrics.views}</div>
                                    </div>
                                    <div className="col-6">
                                        <div className="text-muted small">Unique Readers</div>
                                        <div className="fw-bold fs-4">{metrics.unique}</div>
                                    </div>
                                    <div className="col-12 mt-3">
                                        <div className="text-muted small">Avg Reading Time</div>
                                        <div className="fw-bold">{metrics.readingTime}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Conversion */}
                        <div className="card shadow-sm border-0 mb-4 rounded-4">
                            <div className="card-header bg-white fw-bold py-3">Conversion</div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                                    <span className="text-muted">Newsletter Signups</span>
                                    <strong className="text-success">{metrics.signups}</strong>
                                </div>
                                <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                                    <span className="text-muted">CTA Clicks</span>
                                    <strong>{metrics.ctaClicks}</strong>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Lead Magnet DLs</span>
                                    <strong>{metrics.downloads}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Funnel */}
                        <div className="card shadow-sm border-0 rounded-4">
                            <div className="card-header bg-white fw-bold py-3">Reading Funnel</div>
                            <div className="card-body">
                                <FunnelChart data={funnelData} height={200} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
