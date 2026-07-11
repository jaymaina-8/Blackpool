import React, { useState, useEffect } from 'react'
import { supabase } from '/src/utils/supabase.js'

export default function KnowledgeHub({ navigate }) {
    const [topics, setTopics] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchKnowledgeBase = async () => {
            const { data } = await supabase.from('categories').select('*, articles(id)')
            if (data) {
                // Map the categories to Topics and add an article count
                const enriched = data.map(cat => ({
                    ...cat,
                    articleCount: cat.articles?.length || 0,
                    icon: cat.icon || 'fa-solid fa-folder'
                })).filter(cat => cat.articleCount > 0).sort((a,b) => b.articleCount - a.articleCount)
                setTopics(enriched)
            }
            setLoading(false)
        }
        fetchKnowledgeBase()
    }, [])

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <span className="badge bg-primary-subtle text-primary mb-2 rounded-pill px-3 py-2">Knowledge Hub</span>
                <h1 className="fw-bold tracking-tight display-5 text-dark mb-3">Explore Insights by Topic</h1>
                <p className="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
                    Master website design, SEO, and digital marketing with our curated collections of guides, tutorials, and strategies.
                </p>
            </div>

            <div className="row g-4">
                {topics.map(topic => (
                    <div className="col-lg-4 col-md-6" key={topic.id}>
                        <div 
                            className="card h-100 border-0 shadow-sm rounded-4 cursor-pointer hover-lift"
                            onClick={() => navigate(`/knowledge/topic/${topic.slug}`)}
                        >
                            <div className="card-body p-4 d-flex flex-column">
                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-primary mb-3" style={{width: '60px', height: '60px', fontSize: '1.5rem'}}>
                                    <i className={topic.icon}></i>
                                </div>
                                <h4 className="fw-bold text-dark mb-2">{topic.name}</h4>
                                <p className="text-muted small mb-4 flex-grow-1">
                                    {topic.hero_description || `Explore our comprehensive guides and articles about ${topic.name}.`}
                                </p>
                                <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                    <span className="text-muted small fw-medium">{topic.articleCount} Articles</span>
                                    <span className="text-primary small fw-bold">Explore Hub <i className="fa-solid fa-arrow-right ms-1"></i></span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5 p-5 bg-dark text-white rounded-4 text-center shadow-lg">
                <h3 className="fw-bold mb-3">Not sure where to start?</h3>
                <p className="opacity-75 mb-4">Check out our curated reading paths designed for beginners and experts alike.</p>
                <div className="d-flex gap-3 justify-content-center">
                    <button className="btn btn-primary rounded-pill px-4">Start Beginner Path</button>
                    <button className="btn btn-outline-light rounded-pill px-4" onClick={() => navigate('/blog')}>View Latest Articles</button>
                </div>
            </div>
        </div>
    )
}
