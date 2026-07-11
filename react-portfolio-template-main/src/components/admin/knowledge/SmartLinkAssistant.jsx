import React, { useState, useEffect } from 'react'
import { supabase } from '/src/utils/supabase.js'

export default function SmartLinkAssistant({ articleId, categoryId, onClose }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState([])
    const [recommendations, setRecommendations] = useState([])
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(null)

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!categoryId) return
            // Recommend missing topics/pillars from the same category
            const { data } = await supabase
                .from('articles')
                .select('id, title, slug, is_pillar')
                .eq('category_id', categoryId)
                .neq('id', articleId)
                .eq('status', 'published')
                .order('is_pillar', { ascending: false })
                .limit(5)
            
            if (data) setRecommendations(data)
        }
        fetchRecommendations()
    }, [categoryId, articleId])

    useEffect(() => {
        const search = async () => {
            if (searchTerm.length < 3) {
                setResults([])
                return
            }
            setLoading(true)
            const { data } = await supabase
                .from('articles')
                .select('id, title, slug, is_pillar')
                .ilike('title', `%${searchTerm}%`)
                .eq('status', 'published')
                .neq('id', articleId)
                .limit(10)
            
            if (data) setResults(data)
            setLoading(false)
        }
        
        const timeout = setTimeout(search, 300)
        return () => clearTimeout(timeout)
    }, [searchTerm, articleId])

    const copyMarkdown = (title, slug) => {
        const markdown = `[${title}](/blog/${slug})`
        navigator.clipboard.writeText(markdown)
        setCopied(slug)
        setTimeout(() => setCopied(null), 2000)
    }

    return (
        <div className="offcanvas offcanvas-end show" style={{ width: '400px', visibility: 'visible', zIndex: 1050 }} tabIndex="-1">
            <div className="offcanvas-header border-bottom bg-light">
                <h5 className="offcanvas-title fw-bold"><i className="fa-solid fa-link me-2 text-primary"></i>Link Assistant</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="offcanvas-body">
                <div className="mb-4">
                    <label className="form-label fw-bold small">Search Articles</label>
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0"><i className="fa-solid fa-search text-muted"></i></span>
                        <input 
                            type="text" 
                            className="form-control border-start-0 ps-0" 
                            placeholder="Type to search..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-4"><div className="spinner-border text-primary spinner-border-sm"></div></div>
                ) : results.length > 0 ? (
                    <div className="mb-4">
                        <h6 className="fw-bold text-muted small text-uppercase mb-3">Search Results</h6>
                        <div className="list-group">
                            {results.map(article => (
                                <button 
                                    key={article.id}
                                    className="list-group-item list-group-item-action border-0 px-3 py-2 d-flex justify-content-between align-items-center rounded bg-light mb-2"
                                    onClick={() => copyMarkdown(article.title, article.slug)}
                                >
                                    <div className="text-truncate me-3">
                                        <div className="fw-medium small text-dark">{article.is_pillar && <i className="fa-solid fa-star text-warning me-1"></i>}{article.title}</div>
                                    </div>
                                    <span className="badge bg-white text-dark border">
                                        {copied === article.slug ? 'Copied!' : 'Copy'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : searchTerm.length >= 3 ? (
                    <div className="text-muted small mb-4">No results found.</div>
                ) : null}

                {recommendations.length > 0 && !searchTerm && (
                    <div>
                        <h6 className="fw-bold text-muted small text-uppercase mb-3">Recommended Links in this Cluster</h6>
                        <div className="list-group">
                            {recommendations.map(article => (
                                <button 
                                    key={article.id}
                                    className="list-group-item list-group-item-action border-0 px-3 py-2 d-flex justify-content-between align-items-center rounded bg-primary-subtle mb-2"
                                    onClick={() => copyMarkdown(article.title, article.slug)}
                                >
                                    <div className="text-truncate me-3">
                                        <div className="fw-medium small text-primary">{article.is_pillar && <i className="fa-solid fa-star text-warning me-1"></i>}{article.title}</div>
                                    </div>
                                    <span className="badge bg-white text-primary border border-primary-subtle">
                                        {copied === article.slug ? 'Copied!' : 'Copy'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Backdrop to close */}
            <div 
                className="offcanvas-backdrop show" 
                style={{ zIndex: -1, opacity: 0 }} 
                onClick={onClose}
            ></div>
        </div>
    )
}
