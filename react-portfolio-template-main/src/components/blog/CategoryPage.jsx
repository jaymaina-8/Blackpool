import React, { useEffect, useState } from 'react'
import { usePublicArticles } from '/src/hooks/usePublicArticles.js'
import Pagination from './Pagination.jsx'
import { setDocumentTitle, upsertMeta, upsertLink } from '/src/seo/domHead.js'
import { CANONICAL_ORIGIN } from '/src/seo/seoConfig.js'

export default function CategoryPage({ slug, navigate }) {
    const { fetchArticlesByCategory, isLoading } = usePublicArticles()
    const [articles, setArticles] = useState([])
    const [category, setCategory] = useState(null)
    const [totalCount, setTotalCount] = useState(0)
    const [page, setPage] = useState(1)
    const PAGE_SIZE = 12

    useEffect(() => {
        window.scrollTo(0, 0)
        const load = async () => {
            const { category: catData, articles: results, count } = await fetchArticlesByCategory(slug, { page, limit: PAGE_SIZE })
            setCategory(catData)
            setArticles(results)
            setTotalCount(count)

            if (catData) {
                const title = `${catData.name} | Insights`
                setDocumentTitle(title)
                upsertMeta({ name: "description", content: catData.description || `Browse articles in ${catData.name}` })
                upsertLink({ rel: "canonical", href: `${CANONICAL_ORIGIN}/blog/category/${slug}` })
                
                if (window.gtag && page === 1) {
                    window.gtag('event', 'view_item_list', { item_list_name: `category_${slug}` })
                }
            }
        }
        load()
    }, [slug, page])

    return (
        <div className="container py-5 pb-5">
            <div className="row justify-content-center mb-5">
                <div className="col-lg-8 text-center">
                    <nav aria-label="breadcrumb" className="mb-4">
                        <ol className="breadcrumb justify-content-center small fw-medium">
                            <li className="breadcrumb-item"><a href="/" className="text-decoration-none text-muted">Home</a></li>
                            <li className="breadcrumb-item"><button onClick={() => navigate('/blog')} className="btn btn-link p-0 text-decoration-none text-muted border-0 align-baseline">Insights</button></li>
                            <li className="breadcrumb-item text-muted">Category</li>
                        </ol>
                    </nav>

                    <h1 className="display-4 fw-bold mb-3 tracking-tight" style={{ color: '#1a1a1a', letterSpacing: '-1px' }}>
                        {category ? category.name : <span className="placeholder col-4"></span>}
                    </h1>
                    {category?.description && (
                        <p className="lead text-muted mb-5">
                            {category.description}
                        </p>
                    )}
                    <div className="text-muted small">
                        {totalCount} articles found
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"/></div>
            ) : articles.length > 0 ? (
                <>
                    <div className="row g-4">
                        {/* Render articles similarly to BlogListing */}
                        {articles.map(article => {
                            const words = article.excerpt?.split(/\s+/).length || 0
                            const readTime = Math.max(1, Math.ceil(words / 250))
                            return (
                                <div key={article.id} className="col-md-6 col-lg-4">
                                    <div 
                                        className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden"
                                        style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                        onClick={() => navigate(`/blog/${article.slug}`)}
                                    >
                                        <div className="position-relative bg-light" style={{ height: '200px' }}>
                                            {article.coverUrl && <img src={article.coverUrl} alt="" className="w-100 h-100 object-fit-cover"/>}
                                        </div>
                                        <div className="card-body p-4">
                                            <div className="text-muted small mb-3">{new Date(article.published_at).toLocaleDateString()} &middot; {readTime} min read</div>
                                            <h4 className="fw-bold tracking-tight mb-3">{article.title}</h4>
                                            <p className="text-muted" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.excerpt}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <Pagination currentPage={page} totalCount={totalCount} pageSize={PAGE_SIZE} onPageChange={setPage} />
                </>
            ) : (
                <div className="text-center py-5">
                    <h3 className="fw-bold text-muted mb-3">No articles in this category</h3>
                    <button className="btn btn-primary" onClick={() => navigate('/blog')}>Back to Insights</button>
                </div>
            )}
        </div>
    )
}
