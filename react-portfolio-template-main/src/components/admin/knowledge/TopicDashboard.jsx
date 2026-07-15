import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '/src/utils/supabase.js'

export default function TopicDashboard() {
    const [topics, setTopics] = useState([])
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchKnowledgeGraph = async () => {
            const { data: topicData } = await supabase.from('categories').select('*')
            const { data: articleData } = await supabase.from('articles').select('id, title, category_id, is_pillar, status')
            
            if (topicData && articleData) {
                // Enrich topics with completeness stats
                const enriched = topicData.map(topic => {
                    const topicArticles = articleData.filter(a => a.category_id === topic.id)
                    const published = topicArticles.filter(a => a.status === 'published')
                    const pillars = published.filter(a => a.is_pillar)
                    return {
                        ...topic,
                        total_articles: topicArticles.length,
                        published_articles: published.length,
                        pillars: pillars.length,
                        status: published.length > 5 ? 'Strong' : published.length > 0 ? 'Developing' : 'Empty',
                        completeness: Math.min(100, Math.round((published.length / 10) * 100)) // Target 10 articles per cluster
                    }
                })
                setTopics(enriched)
                setArticles(articleData)
            }
            setLoading(false)
        }
        fetchKnowledgeGraph()
    }, [])

    const { totalTopics, emptyTopics, strongTopics, totalPillars, sortedTopics } = useMemo(() => {
        return {
            totalTopics: topics.length,
            emptyTopics: topics.filter(t => t.status === 'Empty').length,
            strongTopics: topics.filter(t => t.status === 'Strong').length,
            totalPillars: topics.reduce((acc, t) => acc + t.pillars, 0),
            sortedTopics: [...topics].sort((a,b) => b.published_articles - a.published_articles)
        }
    }, [topics])

    if (loading) return <div className="p-5 d-flex justify-content-center"><div className="spinner-border text-primary"></div></div>

    return (
        <div className="d-flex flex-column h-100" style={{ gap: 'var(--admin-gap-md)' }}>
            <div className="d-flex justify-content-between align-items-center mb-2" style={{ gap: 'var(--admin-gap-component)' }}>
                <div>
                    <h1 className="admin-page-title mb-2">Knowledge Hub</h1>
                    <p className="admin-body-text mb-0">Manage topic clusters, reading paths, and pillar pages.</p>
                </div>
                <button className="admin-btn admin-btn-primary shadow-sm">
                    <i className="pi pi-plus me-1"></i> New Topic
                </button>
            </div>

            {/* Top Stats */}
            <div className="row g-4 mb-4 admin-mt-section">
                {[
                    { label: 'Total Topics', value: totalTopics, icon: 'pi-folder', color: 'primary' },
                    { label: 'Pillar Pages', value: totalPillars, icon: 'pi-star-fill', color: 'warning' },
                    { label: 'Strong Clusters', value: strongTopics, icon: 'pi-chart-pie', color: 'success' },
                    { label: 'Empty Topics', value: emptyTopics, icon: 'pi-exclamation-triangle', color: 'danger' },
                ].map((stat, idx) => (
                    <div className="col-6 col-lg-3" key={idx}>
                        <div className="admin-card h-100 position-relative overflow-hidden">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <i className={`pi ${stat.icon} text-${stat.color}`}></i>
                                <span className="admin-meta-text fw-bold text-uppercase tracking-wider">{stat.label}</span>
                            </div>
                            <h2 className="admin-stat-text m-0">{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-4 admin-mt-section">
                {/* Topic Cards */}
                <div className="col-lg-8">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h5 className="admin-section-title m-0">Topic Completeness</h5>
                            <p className="admin-meta-text text-muted m-0 mt-1">Target is 10 published articles per topic.</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="admin-btn admin-btn-ghost text-muted"><i className="pi pi-filter me-2"></i>Filter</button>
                            <button className="admin-btn admin-btn-ghost text-muted"><i className="pi pi-sort-amount-down me-2"></i>Sort</button>
                        </div>
                    </div>

                    <div className="row g-4">
                        {sortedTopics.map(topic => (
                            <div className="col-md-6" key={topic.id}>
                                <div className="admin-card transition-hover d-flex flex-column h-100">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <h6 className="fw-bold mb-1 text-dark">{topic.name}</h6>
                                            <div className="admin-meta-text text-muted">{topic.published_articles} published articles</div>
                                        </div>
                                        <span className={`badge bg-${topic.status === 'Strong' ? 'success' : topic.status === 'Developing' ? 'primary' : 'secondary'} text-white rounded-pill px-2 py-1`} style={{fontSize: '10px'}}>
                                            {topic.status}
                                        </span>
                                    </div>
                                    
                                    <div className="d-flex align-items-center gap-3 mb-4 admin-small-text text-muted">
                                        <span className="d-flex align-items-center gap-1"><i className="pi pi-star text-warning"></i> {topic.pillars} Pillars</span>
                                        <span className="d-flex align-items-center gap-1"><i className="pi pi-file"></i> {topic.total_articles} Total</span>
                                    </div>
                                    
                                    <div className="mt-auto">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="admin-meta-text fw-medium">Completeness</span>
                                            <span className="admin-meta-text fw-bold text-dark">{topic.completeness}%</span>
                                        </div>
                                        <div className="progress bg-light border" style={{height: '6px', overflow: 'hidden'}}>
                                            <div className={`progress-bar bg-${topic.completeness === 100 ? 'success' : 'primary'}`} style={{width: `${topic.completeness}%`}}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Knowledge Graph Snapshot */}
                <div className="col-lg-4">
                    <div className="admin-card sticky-top" style={{ top: '90px' }}>
                        <div className="border-bottom border-light pb-3 mb-4">
                            <h5 className="admin-card-title m-0">Knowledge Graph</h5>
                            <p className="admin-meta-text text-muted m-0 mt-1">Tree representation</p>
                        </div>
                        <div className="bg-light p-3 rounded border border-light" style={{ maxHeight: '600px', overflowY: 'auto', backgroundColor: 'var(--admin-bg-soft)' }}>
                            {topics.slice(0, 3).map(topic => (
                                <div key={topic.id} className="mb-4">
                                    <div className="fw-bold mb-2 text-primary admin-small-text">
                                        <i className="pi pi-folder-open me-2"></i>{topic.name}
                                    </div>
                                    <div className="ps-3 border-start border-2 border-primary ms-2 d-flex flex-column gap-2">
                                        {articles.filter(a => a.category_id === topic.id).slice(0,4).map(article => (
                                            <div key={article.id} className="admin-small-text text-muted text-truncate" style={{maxWidth: '100%'}}>
                                                <span className="text-light-subtle me-1">├──</span>
                                                {article.is_pillar && <i className="pi pi-star-fill text-warning small me-1"></i>}
                                                {article.title}
                                            </div>
                                        ))}
                                        {articles.filter(a => a.category_id === topic.id).length > 4 && (
                                            <div className="admin-small-text text-muted">
                                                <span className="text-light-subtle me-1">└──</span>
                                                ... and {articles.filter(a => a.category_id === topic.id).length - 4} more
                                            </div>
                                        )}
                                        {articles.filter(a => a.category_id === topic.id).length === 0 && (
                                            <div className="admin-small-text text-danger opacity-75 fst-italic">
                                                <span className="text-light-subtle me-1">└──</span>
                                                No articles
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {topics.length > 3 && (
                                <div className="text-center mt-3 pt-3 border-top border-light">
                                    <button className="admin-btn admin-btn-ghost text-primary w-100">View Full Graph</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
