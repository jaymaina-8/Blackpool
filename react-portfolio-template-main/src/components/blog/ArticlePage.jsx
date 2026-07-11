import React, { useEffect, useState, lazy, Suspense, useRef, useCallback } from 'react'
import { usePublicArticles } from '/src/hooks/usePublicArticles.js'
import RelatedArticles from './RelatedArticles.jsx'
import ArticleNotFound from './ArticleNotFound.jsx'
import TableOfContents from './TableOfContents.jsx'
import ArticleShare from './ArticleShare.jsx'
import ArticleNavigation from './ArticleNavigation.jsx'
import ReadingProgress from './ReadingProgress.jsx'
import ReadingPreferences from './ReadingPreferences.jsx'
import ArticleLightbox from './ArticleLightbox.jsx'
import { upsertMeta, upsertLink, upsertJsonLd, setDocumentTitle } from '/src/seo/domHead.js'
import { CANONICAL_ORIGIN, DEFAULT_OG_IMAGE_URL } from '/src/seo/seoConfig.js'
import { useAnalytics } from '/src/hooks/useAnalytics.js'
import ArticleScrollTracker from '/src/components/analytics/ArticleScrollTracker.jsx'
import { supabase } from '/src/utils/supabase.js'

// Lazy loaded Lead Gen Components
const DynamicCTA = lazy(() => import('/src/components/marketing/DynamicCTA.jsx'))
const AuthorCard = lazy(() => import('./AuthorCard.jsx'))
const RelatedServices = lazy(() => import('./RelatedServices.jsx'))
const NewsletterSignup = lazy(() => import('./NewsletterSignup.jsx'))
const ReadingCompletionCTA = lazy(() => import('./ReadingCompletionCTA.jsx'))

export default function ArticlePage({ slug, navigate }) {
    const { fetchArticleBySlug, incrementViewCount, fetchAdjacentArticles, isLoading } = usePublicArticles()
    const { trackPageView } = useAnalytics()
    const [article, setArticle] = useState(null)
    const [fetched, setFetched] = useState(false)
    const [htmlWithIds, setHtmlWithIds] = useState('')
    const [adjacent, setAdjacent] = useState({ prev: null, next: null })
    const [topics, setTopics] = useState([])
    
    // Lightbox state
    const [lightboxImages, setLightboxImages] = useState([])
    const [lightboxIndex, setLightboxIndex] = useState(-1)

    // Completion animation state
    const [completionVisible, setCompletionVisible] = useState(false)
    const completionRef = useRef(null)

    useEffect(() => {
        window.scrollTo(0, 0)
        const load = async () => {
            const data = await fetchArticleBySlug(slug)
            
            if (data?.redirect) {
                navigate(`/blog/${data.redirect}`)
                return
            }

            setArticle(data)
            
            if (data?.published_at) {
                const adj = await fetchAdjacentArticles(data.published_at)
                setAdjacent(adj)
            }

            // Track page view for Analytics Engine
            if (data) {
                trackPageView(window.location.pathname, data.id)
            }

            if (data?.html_content) {
                const parser = new DOMParser()
                const doc = parser.parseFromString(data.html_content, 'text/html')
                
                // H2, H3: Add IDs and Anchor links
                doc.querySelectorAll('h2, h3').forEach(el => {
                    if (!el.id) {
                        el.id = (el.textContent || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                    }
                    const anchor = doc.createElement('a')
                    anchor.className = 'heading-anchor'
                    anchor.href = `#${el.id}`
                    anchor.innerHTML = '<i class="fa-solid fa-link" style="font-size: 0.7em;"></i>'
                    anchor.onclick = (e) => {
                        e.preventDefault()
                        const url = new URL(window.location.href)
                        url.hash = el.id
                        navigator.clipboard.writeText(url.toString())
                    }
                    el.prepend(anchor)
                })

                const imgArray = []
                doc.querySelectorAll('img').forEach((img, idx) => {
                    img.setAttribute('loading', 'lazy')
                    img.setAttribute('decoding', 'async')
                    img.dataset.index = idx
                    imgArray.push({ src: img.src, alt: img.alt })
                })
                setLightboxImages(imgArray)

                setHtmlWithIds(doc.body.innerHTML)
            }

            if (data?.id) {
                incrementViewCount(data.id)
            }

            setFetched(true)
            
            // Fetch Topics for Navigation
            const { data: topicData } = await supabase.from('categories').select('id, name, slug').limit(10)
            if (topicData) setTopics(topicData)
        }
        load()
    }, [slug])

    // Keyboard Navigation
    useEffect(() => {
        const handleGlobalKeydown = (e) => {
            // Ignore if in lightbox or typing
            if (lightboxIndex >= 0 || ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
            
            if (e.key === 'Home') window.scrollTo({ top: 0, behavior: 'smooth' })
            if (e.key === 'End') window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
            if (e.key === 'ArrowLeft' && adjacent.prev) navigate(`/blog/${adjacent.prev.slug}`)
            if (e.key === 'ArrowRight' && adjacent.next) navigate(`/blog/${adjacent.next.slug}`)
        }
        window.addEventListener('keydown', handleGlobalKeydown)
        return () => window.removeEventListener('keydown', handleGlobalKeydown)
    }, [adjacent, navigate, lightboxIndex])

    // Inject SEO Metadata
    useEffect(() => {
        if (!article) return

        const title = article.seo_title || article.title
        const description = article.seo_description || article.excerpt || article.title
        const canonicalUrl = `${CANONICAL_ORIGIN}/blog/${article.slug}`
        const ogImage = article.coverUrl || DEFAULT_OG_IMAGE_URL

        setDocumentTitle(title)
        upsertLink({ rel: "canonical", href: canonicalUrl })
        upsertMeta({ name: "description", content: description })
        upsertMeta({ property: "og:type", content: "article" })
        upsertMeta({ property: "og:url", content: canonicalUrl })
        upsertMeta({ property: "og:title", content: title })
        upsertMeta({ property: "og:description", content: description })
        upsertMeta({ property: "og:image", content: ogImage })
        upsertMeta({ name: "twitter:card", content: "summary_large_image" })
        upsertMeta({ name: "twitter:url", content: canonicalUrl })
        upsertMeta({ name: "twitter:title", content: title })
        upsertMeta({ name: "twitter:description", content: description })
        upsertMeta({ name: "twitter:image", content: ogImage })

        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": title,
            "description": description,
            "image": ogImage,
            "datePublished": article.published_at,
            "dateModified": article.updated_at || article.published_at,
            "author": {
                "@type": "Person",
                "name": article.author?.full_name || "Blackpool",
                "url": article.author?.slug ? `${CANONICAL_ORIGIN}/blog/author/${article.author.slug}` : undefined
            }
        }
        
        if (article.reviewer) {
            jsonLd.reviewedBy = {
                "@type": "Person",
                "name": article.reviewer.full_name,
                "url": article.reviewer.slug ? `${CANONICAL_ORIGIN}/blog/author/${article.reviewer.slug}` : undefined
            }
        }
        
        upsertJsonLd({ id: "seo-jsonld-article", json: jsonLd })

        if (window.gtag) {
            window.gtag('event', 'page_view', { page_path: `/blog/${article.slug}` })
        }
    }, [article])

    // Post-render DOM manipulation
    useEffect(() => {
        if (!htmlWithIds) return

        const container = document.querySelector('.article-content')
        if (!container) return

        // 1. Lightbox click events
        const images = container.querySelectorAll('img')
        const handleImageClick = (e) => {
            const idx = parseInt(e.target.dataset.index, 10)
            if (!isNaN(idx)) setLightboxIndex(idx)
        }
        images.forEach(img => {
            img.style.cursor = 'zoom-in'
            img.addEventListener('click', handleImageClick)
        })

        // 2. Copy Code buttons
        const preBlocks = container.querySelectorAll('pre')
        preBlocks.forEach(pre => {
            if (pre.querySelector('.copy-btn')) return // already added
            
            const btn = document.createElement('button')
            btn.className = 'copy-btn'
            btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy'
            
            btn.addEventListener('click', () => {
                const code = pre.querySelector('code')?.innerText || pre.innerText
                const textToCopy = code.replace(/Copy$/, '').trim()
                navigator.clipboard.writeText(textToCopy).then(() => {
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied'
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy'
                    }, 2000)
                })
            })
            pre.appendChild(btn)
        })

        // 3. Heading anchor link click handling
        const anchors = container.querySelectorAll('.heading-anchor')
        const handleAnchorClick = (e) => {
            e.preventDefault()
            const id = e.currentTarget.parentElement.id
            const url = new URL(window.location.href)
            url.hash = id
            navigator.clipboard.writeText(url.toString())
        }
        anchors.forEach(a => a.addEventListener('click', handleAnchorClick))

        return () => {
            images.forEach(img => img.removeEventListener('click', handleImageClick))
            anchors.forEach(a => a.removeEventListener('click', handleAnchorClick))
        }
    }, [htmlWithIds])

    // Intersection Observer for Reading Completion
    useEffect(() => {
        if (!completionRef.current) return
        
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setCompletionVisible(true)
                observer.disconnect()
            }
        }, { threshold: 0.1 })
        
        observer.observe(completionRef.current)
        return () => observer.disconnect()
    }, [htmlWithIds])

    if (isLoading && !fetched) {
        return <div className="container py-5 text-center min-vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border text-primary"/></div>
    }

    if (!article) {
        return <ArticleNotFound navigate={navigate} />
    }

    const words = article.word_count || (article.html_content?.replace(/<[^>]*>?/gm, '').split(/\s+/).length || 0)
    const readTime = article.estimated_reading_time || Math.max(1, Math.ceil(words / 250))
    const pubDate = new Date(article.published_at)
    const updateDate = new Date(article.updated_at || article.published_at)
    const isUpdated = (updateDate.getTime() - pubDate.getTime()) > (1000 * 60 * 60 * 24)
    const articleUrl = `${CANONICAL_ORIGIN}/blog/${article.slug}`

    return (
        <article className="blog-article pb-5">
            <ReadingProgress readTimeMinutes={readTime} articleUrl={articleUrl} articleTitle={article.title} />
            
            {/* Premium Hero Section */}
            <header className="article-hero pt-5 pb-5 mb-5 bg-white border-bottom">
                <div className="container text-center" style={{ maxWidth: '900px' }}>
                    {/* Centered Breadcrumbs */}
                    <nav aria-label="breadcrumb" className="mb-4 d-flex justify-content-center position-relative">
                        <ol className="breadcrumb small fw-medium mb-0">
                            <li className="breadcrumb-item"><a href="/" className="text-decoration-none text-muted">Home</a></li>
                            <li className="breadcrumb-item"><a href="/knowledge" onClick={(e) => { e.preventDefault(); navigate('/knowledge'); }} className="text-decoration-none text-muted">Insights</a></li>
                            {article.category && <li className="breadcrumb-item"><a href={`/knowledge/topic/${article.category.slug}`} onClick={(e) => { e.preventDefault(); navigate(`/knowledge/topic/${article.category.slug}`); }} className="text-decoration-none text-muted">{article.category.name}</a></li>}
                            <li className="breadcrumb-item active text-dark">{article.title}</li>
                        </ol>
                    </nav>

                    <h1 className="display-4 fw-bold mb-4 tracking-tight" style={{ letterSpacing: '-1.5px', lineHeight: '1.2' }}>
                        {article.title}
                    </h1>

                    <div className="d-flex flex-wrap align-items-center justify-content-center gap-3 mb-5 text-muted small fw-medium text-uppercase tracking-wider">
                        {article.is_pillar && (
                            <span className="badge bg-warning text-dark py-2 px-3 rounded-pill border border-warning">
                                <i className="fa-solid fa-star me-2"></i>Complete Guide
                            </span>
                        )}
                        {article.category && (
                            <span 
                                className="badge bg-light text-dark py-2 px-3 rounded-pill border cursor-pointer hover-lift"
                                onClick={() => navigate(`/knowledge/topic/${article.category.slug}`)}
                            >
                                {article.category.name}
                            </span>
                        )}
                        <span>{pubDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>{readTime} min read</span>
                        {isUpdated && (
                            <>
                                <span>•</span>
                                <span className="text-primary" title="Last Updated">
                                    <i className="fa-solid fa-clock-rotate-left me-1"></i>
                                    Updated {updateDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Author */}
                    <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-4">
                        <div className="d-flex align-items-center gap-3">
                            {article.author?.avatar_url ? (
                                <img src={article.author.avatar_url} alt="Author" className="rounded-circle shadow-sm" width="56" height="56" />
                            ) : (
                                <div className="bg-light rounded-circle shadow-sm d-flex align-items-center justify-content-center text-muted" style={{width: '56px', height: '56px'}}>
                                    <i className="fa-solid fa-user"></i>
                                </div>
                            )}
                            <div className="text-start">
                                <div className="fw-bold fs-6">{article.author?.full_name || 'Anonymous'}</div>
                                {article.author?.bio && <div className="text-muted small">{article.author.bio}</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Layout Grid */}
            <div className="container-fluid px-xl-5">
                <div className="row justify-content-center">
                    
                    {/* Left: Knowledge Navigation Sidebar (Desktop) */}
                    <div className="col-xl-2 d-none d-xl-block">
                        <div className="sticky-top" style={{ top: '120px' }}>
                            <h6 className="fw-bold mb-3 text-uppercase text-muted" style={{ letterSpacing: '1px', fontSize: '0.8rem' }}>Knowledge Hub</h6>
                            <div className="list-group list-group-flush border-0">
                                {topics.map(topic => (
                                    <button 
                                        key={topic.id} 
                                        className={`list-group-item list-group-item-action border-0 px-0 py-2 small ${article.category?.id === topic.id ? 'fw-bold text-primary bg-transparent' : 'text-muted'}`}
                                        onClick={() => navigate(`/knowledge/topic/${topic.slug}`)}
                                    >
                                        {topic.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Center: Main Content */}
                    <div className="col-12 col-lg-9 col-xl-7 article-content-container">
                        {article.coverUrl && (
                            <figure className="mb-5">
                                <img 
                                    src={article.coverUrl} 
                                    alt={article.cover?.alt_text || article.title}
                                    className="img-fluid rounded-4 shadow-sm w-100 object-fit-cover"
                                    style={{ maxHeight: '600px' }}
                                    width={article.cover?.width || undefined}
                                    height={article.cover?.height || undefined}
                                />
                                {article.cover?.alt_text && (
                                    <figcaption className="text-center text-muted small mt-3 fst-italic">
                                        {article.cover.alt_text}
                                    </figcaption>
                                )}
                            </figure>
                        )}

                        <div 
                            className="article-content mx-auto"
                            dangerouslySetInnerHTML={{ __html: htmlWithIds }} 
                        />

                        {/* Reading Statistics Footer */}
                        <div className="mt-5 pt-4 pb-2 border-top mx-auto text-muted small d-flex flex-wrap gap-4">
                            <div>
                                <strong className="d-block text-uppercase tracking-wider mb-1" style={{ fontSize: '0.75rem' }}>Word Count</strong>
                                {words.toLocaleString()} words
                            </div>
                            <div>
                                <strong className="d-block text-uppercase tracking-wider mb-1" style={{ fontSize: '0.75rem' }}>Reading Time</strong>
                                {readTime} minute read
                            </div>
                        </div>
                        
                        {/* Reading Completion Layer */}
                        <div ref={completionRef} className={`reading-completion-layer ${completionVisible ? 'visible' : ''}`}>
                            <ArticleNavigation adjacent={adjacent} navigate={navigate} />

                            <div className="mt-5 pt-4">
                                <Suspense fallback={<div className="py-5 text-center"><div className="spinner-border text-primary spinner-border-sm" /></div>}>
                                    <DynamicCTA placement="blog" category={article.category?.name} />
                                    <div className="mt-5"><AuthorCard author={article.author} /></div>
                                    <div className="mt-5"><NewsletterSignup /></div>
                                </Suspense>
                            </div>
                        </div>
                    </div>

                    {/* Right: Sticky Table of Contents & Share (Desktop Only) */}
                    <div className="col-xl-3 d-none d-xl-block ps-xl-5">
                        <div className="sticky-top" style={{ top: '120px' }}>
                            <TableOfContents htmlContent={htmlWithIds} />
                            
                            <div className="mt-5 ps-4 d-flex align-items-center gap-3">
                                <div>
                                    <h6 className="fw-bold mb-3 text-uppercase text-muted" style={{ letterSpacing: '1px', fontSize: '0.8rem' }}>Share</h6>
                                    <ArticleShare url={articleUrl} title={article.title} />
                                </div>
                                <div className="ms-auto border-start ps-3">
                                    <h6 className="fw-bold mb-3 text-uppercase text-muted" style={{ letterSpacing: '1px', fontSize: '0.8rem' }}>Read</h6>
                                    <ReadingPreferences />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Related Topics & Articles Area */}
            <div className={`mt-5 bg-light border-top py-5 reading-completion-layer ${completionVisible ? 'visible' : ''}`}>
                <div className="container" style={{ maxWidth: '1200px' }}>
                    
                    <div className="mb-5 text-center">
                        <h3 className="fw-bold mb-4">Explore Related Topics</h3>
                        <div className="d-flex flex-wrap justify-content-center gap-3">
                            {topics.map(topic => (
                                <button 
                                    key={topic.id}
                                    className="btn btn-white border rounded-pill shadow-sm hover-lift px-4"
                                    onClick={() => navigate(`/knowledge/topic/${topic.slug}`)}
                                >
                                    {topic.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <RelatedArticles article={article} navigate={navigate} />

                </div>
            </div>

            <Suspense fallback={null}>
                <ReadingCompletionCTA />
            </Suspense>

            {/* Scroll Funnel Tracker */}
            {article && <ArticleScrollTracker articleId={article.id} />}

            {/* Lightbox Modal */}
            <ArticleLightbox 
                images={lightboxImages} 
                currentIndex={lightboxIndex} 
                onClose={() => setLightboxIndex(-1)} 
                onNavigate={(step) => {
                    setLightboxIndex(prev => {
                        let next = prev + step
                        if (next < 0) next = lightboxImages.length - 1
                        if (next >= lightboxImages.length) next = 0
                        return next
                    })
                }} 
            />
        </article>
    )
}
