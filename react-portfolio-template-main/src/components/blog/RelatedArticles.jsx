import React, { useEffect, useState } from 'react'
import { usePublicArticles } from '/src/hooks/usePublicArticles.js'

import { track, EVENTS } from '/src/utils/analytics/index.js'

export default function RelatedArticles({ article, navigate }) {
    const { fetchRelatedArticles } = usePublicArticles()
    const [articles, setArticles] = useState([])

    useEffect(() => {
        const load = async () => {
            if (article?.id) {
                const data = await fetchRelatedArticles(article, 3)
                setArticles(data || [])
            }
        }
        load()
    }, [article])

    if (articles.length === 0) return null

    return (
        <div className="related-articles-section">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0">Related Insights</h3>
                <button className="btn btn-link text-decoration-none fw-medium p-0 text-primary" onClick={() => navigate('/blog')}>
                    View All <i className="fa-solid fa-arrow-right ms-1"></i>
                </button>
            </div>
            <div className="row g-4">
                {articles.map(article => (
                    <div key={article.id} className="col-md-4">
                        <div 
                            className="card h-100 border-0 shadow-sm cursor-pointer blog-card transition-all"
                            onClick={() => {
                                track(EVENTS.RELATED_ARTICLE_CLICKED, { destination_slug: article.slug })
                                navigate(`/blog/${article.slug}`)
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            {article.coverUrl ? (
                                <img src={article.coverUrl} className="card-img-top object-fit-cover" alt={article.title} style={{height: '150px'}} />
                            ) : (
                                <div className="card-img-top bg-light d-flex align-items-center justify-content-center text-muted" style={{height: '150px'}}>
                                    <i className="fa-regular fa-image fs-4 opacity-25"></i>
                                </div>
                            )}
                            <div className="card-body">
                                <h6 className="card-title fw-bold mb-2 lh-sm">{article.title}</h6>
                                <small className="text-muted">{new Date(article.published_at).toLocaleDateString()}</small>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
