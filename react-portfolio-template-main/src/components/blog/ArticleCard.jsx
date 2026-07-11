import React from 'react'
import { useApi } from '/src/hooks/api.js'
import { track, EVENTS } from '/src/utils/analytics/index.js'

export default function ArticleCard({ article, variant = 'default', navigate, customBadge = null }) {
    const api = useApi()
    
    if (!article) return <ArticleCard.Skeleton variant={variant} />

    const words = article.excerpt?.split(/\s+/).length || article.html_content?.replace(/<[^>]*>?/gm, '').split(/\s+/).length || 0
    const readTime = Math.max(1, Math.ceil(words / 250))
    const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const authorName = article.author?.full_name || 'Blackpool Industry Team'
    const authorRole = article.author?.job_title || (article.author?.full_name ? 'Founder, Blackpool Industry' : 'Digital Growth Experts')

    // Business Impact Labels mapping
    const impactLabels = {
        'seo': '🌍 Get Found on Google',
        'website-design': '📈 Increase Sales',
        'ai': '⚡ Automate Your Business',
        'branding': '🎯 Build Brand Trust'
    }
    const categorySlug = article.category?.slug?.toLowerCase() || ''
    const displayCategory = impactLabels[categorySlug] || article.category?.name

    // Article Freshness
    let freshnessBadge = null
    const pubDate = new Date(article.published_at)
    const updateDate = new Date(article.updated_at || article.published_at)
    const now = new Date()
    
    const daysSincePub = Math.floor((now - pubDate) / (1000 * 60 * 60 * 24))
    const daysSinceUpdate = Math.floor((now - updateDate) / (1000 * 60 * 60 * 24))
    
    if (daysSinceUpdate < 7 && daysSinceUpdate < daysSincePub) {
        freshnessBadge = "Updated this week"
    } else if (daysSinceUpdate >= 7 && daysSinceUpdate < 30 && daysSinceUpdate < daysSincePub) {
        freshnessBadge = `Updated ${daysSinceUpdate} days ago`
    } else if (daysSincePub < 14) {
        freshnessBadge = "New"
    } else if (daysSinceUpdate < 60 && daysSinceUpdate < daysSincePub) {
        freshnessBadge = "Recently updated"
    }

    const gradients = [
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
        'linear-gradient(135deg, #accbee 0%, #e7f0fd 100%)'
    ]
    const fallbackGradient = gradients[typeof article.id === 'number' ? article.id % gradients.length : String(article.id).charCodeAt(0) % gradients.length]

    const handleClick = (e) => {
        if (navigate) {
            // Track click if on homepage (assuming customBadge implies homepage context)
            if (customBadge) {
                track(EVENTS.HOMEPAGE_ARTICLE_CLICKED, { slug: article.slug, title: article.title })
            }
            navigate(`/blog/${article.slug}`)
        }
    }

    if (variant === 'featured') {
        return (
            <div 
                className="card border-0 shadow-sm rounded-4 overflow-hidden text-decoration-none text-dark h-100"
                style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onClick={handleClick}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.classList.add('shadow-lg')
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.classList.remove('shadow-lg')
                }}
            >
                <div className="row g-0 h-100">
                    <div className="col-lg-7 position-relative">
                        {article.coverUrl ? (
                            <img 
                                src={article.coverUrl} 
                                alt={article.cover?.alt_text || article.title} 
                                className="w-100 h-100 object-fit-cover"
                                style={{ minHeight: '350px' }}
                            />
                        ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted" style={{ minHeight: '350px', background: fallbackGradient }}>
                                <i className="fa-regular fa-newspaper fs-1 opacity-25"></i>
                            </div>
                        )}
                        <div className="position-absolute top-0 start-0 w-100 p-4 d-flex justify-content-between">
                            {displayCategory && (
                                <span 
                                    className="badge bg-white text-dark shadow-sm px-3 py-2 rounded-pill fs-6 fw-bold"
                                    onClick={(e) => {
                                        if (navigate && article.category) {
                                            e.stopPropagation()
                                            navigate(`/blog/category/${article.category.slug}`)
                                        }
                                    }}
                                >
                                    {displayCategory}
                                </span>
                            )}
                            {customBadge ? customBadge : article.is_featured && (
                                <span className="badge bg-warning text-dark shadow-sm px-3 py-2 rounded-pill fs-6">
                                    <i className="fa-solid fa-star me-1"></i> Featured
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="col-lg-5 d-flex flex-column p-5">
                        <div className="d-flex align-items-center flex-wrap gap-3 mb-4 text-muted small fw-medium text-uppercase tracking-wider">
                            <span>{formattedDate}</span>
                            <span>•</span>
                            <span>{readTime} min read</span>
                            {freshnessBadge && (
                                <>
                                    <span>•</span>
                                    <span className="text-primary fw-bold">{freshnessBadge}</span>
                                </>
                            )}
                        </div>
                        <h2 className="card-title fw-bold mb-4 tracking-tight display-6">
                            {article.title}
                        </h2>
                        <p className="card-text text-muted fs-5 mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {article.excerpt}
                        </p>
                        <div className="mt-auto d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                                {article.author?.avatar_url ? (
                                    <img src={article.author.avatar_url} alt="Author" className="rounded-circle" width="48" height="48" />
                                ) : (
                                    <div className="bg-white rounded-circle d-flex align-items-center justify-content-center text-muted border shadow-sm" style={{width: '48px', height: '48px'}}>
                                        <i className="fa-solid fa-user"></i>
                                    </div>
                                )}
                                <div className="d-flex flex-column">
                                    <span className="fw-bold">{authorName}</span>
                                    <span className="text-muted small">{authorRole}</span>
                                </div>
                            </div>
                            <button className="btn btn-outline-primary rounded-pill px-4 fw-medium">
                                Read Article
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Default variant
    return (
        <div 
            className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden text-decoration-none text-dark"
            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onClick={handleClick}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.classList.add('shadow')
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.classList.remove('shadow')
            }}
        >
            <div className="position-relative bg-light" style={{ height: '200px', background: !article.coverUrl ? fallbackGradient : undefined }}>
                {article.coverUrl ? (
                    <img 
                        src={article.coverUrl} 
                        alt={article.cover?.alt_text || article.title} 
                        className="w-100 h-100 object-fit-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted" style={{ background: fallbackGradient }}>
                        <i className="fa-regular fa-newspaper fs-1 opacity-25"></i>
                    </div>
                )}
                <div className="position-absolute top-0 start-0 w-100 p-3 d-flex justify-content-between">
                    {displayCategory && (
                        <span 
                            className="badge bg-white text-dark shadow-sm px-3 py-2 rounded-pill fw-bold"
                            onClick={(e) => {
                                if (navigate && article.category) {
                                    e.stopPropagation()
                                    navigate(`/blog/category/${article.category.slug}`)
                                }
                            }}
                        >
                            {displayCategory}
                        </span>
                    )}
                    {customBadge ? customBadge : article.is_featured && (
                        <span className="badge bg-warning text-dark shadow-sm px-3 py-2 rounded-pill">
                            <i className="fa-solid fa-star me-1"></i> Featured
                        </span>
                    )}
                </div>
            </div>
            <div className="card-body p-4 d-flex flex-column">
                <div className="d-flex align-items-center flex-wrap gap-2 mb-3 text-muted small fw-medium">
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span>{readTime} min read</span>
                    {freshnessBadge && (
                        <>
                            <span>•</span>
                            <span className="text-primary fw-bold">{freshnessBadge}</span>
                        </>
                    )}
                </div>
                <h4 className="card-title fw-bold mb-3 tracking-tight" style={{ letterSpacing: '-0.5px' }}>
                    {article.title}
                </h4>
                <p className="card-text text-muted" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {article.excerpt}
                </p>
            </div>
            <div className="card-footer bg-white border-0 p-4 pt-0 mt-auto">
                <div className="d-flex align-items-center gap-2">
                    {article.author?.avatar_url ? (
                        <img src={article.author.avatar_url} alt="Author" className="rounded-circle" width="32" height="32" />
                    ) : (
                        <div className="bg-white rounded-circle d-flex align-items-center justify-content-center text-muted border shadow-sm" style={{width: '32px', height: '32px'}}>
                            <i className="fa-solid fa-user small"></i>
                        </div>
                    )}
                    <div className="d-flex flex-column">
                        <span className="small fw-bold">{authorName}</span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>{authorRole}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

ArticleCard.Skeleton = function ArticleCardSkeleton({ variant = 'default' }) {
    if (variant === 'featured') {
        return (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                <div className="row g-0 h-100">
                    <div className="col-lg-7 bg-light placeholder-glow" style={{ minHeight: '350px' }}>
                        <span className="placeholder w-100 h-100"></span>
                    </div>
                    <div className="col-lg-5 d-flex flex-column p-5 placeholder-glow">
                        <div className="mb-4">
                            <span className="placeholder col-4 rounded-pill"></span>
                        </div>
                        <h2 className="mb-4">
                            <span className="placeholder col-10 rounded"></span>
                            <span className="placeholder col-8 rounded"></span>
                        </h2>
                        <div className="mb-4">
                            <span className="placeholder col-12 rounded"></span>
                            <span className="placeholder col-12 rounded"></span>
                            <span className="placeholder col-6 rounded"></span>
                        </div>
                        <div className="mt-auto d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                                <span className="placeholder rounded-circle" style={{width: '48px', height: '48px'}}></span>
                                <span className="placeholder col-3 rounded"></span>
                            </div>
                            <span className="placeholder col-3 rounded-pill py-3"></span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden placeholder-glow">
            <div className="bg-light" style={{ height: '200px' }}>
                <span className="placeholder w-100 h-100"></span>
            </div>
            <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-3">
                    <span className="placeholder col-4 rounded"></span>
                    <span className="placeholder col-3 rounded"></span>
                </div>
                <h4 className="mb-3">
                    <span className="placeholder col-10 rounded"></span>
                    <span className="placeholder col-8 rounded"></span>
                </h4>
                <div className="mb-3">
                    <span className="placeholder col-12 rounded"></span>
                    <span className="placeholder col-12 rounded"></span>
                    <span className="placeholder col-8 rounded"></span>
                </div>
            </div>
            <div className="card-footer bg-white border-0 p-4 pt-0 mt-auto">
                <div className="d-flex align-items-center gap-2">
                    <span className="placeholder rounded-circle" style={{width: '32px', height: '32px'}}></span>
                    <span className="placeholder col-4 rounded"></span>
                </div>
            </div>
        </div>
    )
}
