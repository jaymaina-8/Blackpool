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

    if (loading) return <div className="p-4 d-flex justify-content-center"><div className="spinner-border text-primary"></div></div>

    return (
        <div className="p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-1">Knowledge Hub Dashboard</h2>
                    <p className="text-muted m-0">Manage topic clusters, reading paths, and pillar pages.</p>
                </div>
                <button className="btn btn-primary px-4 fw-medium shadow-sm"><i className="fa-solid fa-plus me-2"></i>New Topic</button>
            </div>

            {/* Top Stats */}
            <div className="row g-4 mb-5">
                {[
                    { label: 'Total Topics', value: totalTopics, icon: 'fa-layer-group', color: 'primary' },
                    { label: 'Pillar Pages', value: totalPillars, icon: 'fa-star', color: 'warning' },
                    { label: 'Strong Clusters', value: strongTopics, icon: 'fa-chart-pie', color: 'success' },
                    { label: 'Empty Topics', value: emptyTopics, icon: 'fa-triangle-exclamation', color: 'danger' },
                ].map((stat, idx) => (
                    <div className="col-md-6 col-xl-3" key={idx}>
                        <div className="card border-0 shadow-sm rounded-4 h-100 p-4 d-flex flex-row align-items-center gap-3">
                            <div className={`bg-${stat.color}-subtle text-${stat.color} rounded-circle d-flex justify-content-center align-items-center`} style={{width: '60px', height: '60px', fontSize: '1.5rem'}}>
                                <i className={`fa-solid ${stat.icon}`}></i>
                            </div>
                            <div>
                                <h3 className="fw-bold m-0">{stat.value}</h3>
                                <div className="text-muted small fw-medium">{stat.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-5">
                {/* Topic Completeness */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
                        <div className="card-header bg-white border-bottom p-4">
                            <h5 className="fw-bold m-0">Topic Completeness</h5>
                            <p className="small text-muted m-0">Target is 10 published articles per topic.</p>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle m-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4 text-uppercase text-muted small fw-semibold">Topic</th>
                                            <th className="text-uppercase text-muted small fw-semibold">Status</th>
                                            <th className="text-uppercase text-muted small fw-semibold">Pillars</th>
                                            <th className="text-uppercase text-muted small fw-semibold w-25">Progress</th>
                                            <th className="pe-4 text-end text-uppercase text-muted small fw-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-top-0">
                                        {sortedTopics.map(topic => (
                                            <tr key={topic.id}>
                                                <td className="ps-4 py-3">
                                                    <div className="fw-bold">{topic.name}</div>
                                                    <div className="text-muted small">{topic.published_articles} published articles</div>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${topic.status === 'Strong' ? 'success' : topic.status === 'Developing' ? 'primary' : 'secondary'}-subtle text-${topic.status === 'Strong' ? 'success' : topic.status === 'Developing' ? 'primary' : 'secondary'} rounded-pill`}>
                                                        {topic.status}
                                                    </span>
                                                </td>
                                                <td>{topic.pillars} <i className="fa-solid fa-star text-warning small ms-1"></i></td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="progress flex-grow-1" style={{height: '6px'}}>
                                                            <div className={`progress-bar bg-${topic.completeness === 100 ? 'success' : 'primary'}`} style={{width: `${topic.completeness}%`}}></div>
                                                        </div>
                                                        <span className="small text-muted fw-medium">{topic.completeness}%</span>
                                                    </div>
                                                </td>
                                                <td className="pe-4 text-end">
                                                    <button className="btn btn-sm btn-light text-primary fw-medium">Manage</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Knowledge Graph Snapshot */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-header bg-white border-bottom p-4">
                            <h5 className="fw-bold m-0">Knowledge Graph</h5>
                            <p className="small text-muted m-0">Tree representation</p>
                        </div>
                        <div className="card-body p-4 bg-light rounded-bottom-4">
                            {topics.slice(0, 3).map(topic => (
                                <div key={topic.id} className="mb-4">
                                    <div className="fw-bold mb-2 text-primary"><i className="fa-solid fa-folder-tree me-2"></i>{topic.name}</div>
                                    <div className="ps-3 border-start border-2 ms-2">
                                        {articles.filter(a => a.category_id === topic.id).slice(0,4).map(article => (
                                            <div key={article.id} className="small text-muted mb-1 text-truncate" style={{maxWidth: '250px'}}>
                                                ├── {article.is_pillar && <i className="fa-solid fa-star text-warning small me-1"></i>}{article.title}
                                            </div>
                                        ))}
                                        {articles.filter(a => a.category_id === topic.id).length > 4 && (
                                            <div className="small text-muted mb-1">
                                                └── ... and {articles.filter(a => a.category_id === topic.id).length - 4} more
                                            </div>
                                        )}
                                        {articles.filter(a => a.category_id === topic.id).length === 0 && (
                                            <div className="small text-danger opacity-75 fst-italic">└── No articles</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
