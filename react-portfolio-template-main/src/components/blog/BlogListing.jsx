import React, { useEffect, useState } from 'react'
import { usePublicArticles } from '/src/hooks/usePublicArticles.js'
import { useBlogSearch } from '/src/hooks/useBlogSearch.js'
import BlogSearch from './BlogSearch.jsx'
import Pagination from './Pagination.jsx'
import ArticleCard from './ArticleCard.jsx'
import NewsletterSignup from './NewsletterSignup.jsx'
import { setDocumentTitle, upsertMeta, upsertLink } from '/src/seo/domHead.js'
import { CANONICAL_ORIGIN } from '/src/seo/seoConfig.js'

export default function BlogListing({ navigate }) {
    const { 
        fetchFeaturedArticles, 
        fetchLatestArticles, 
        fetchPopularArticles, 
        fetchCategories, 
        isLoading: isLoadingArticles 
    } = usePublicArticles()
    
    const { performSearch, isSearching } = useBlogSearch()
    
    // Parse URL for search
    const urlParams = new URLSearchParams(window.location.search)
    const initialQuery = urlParams.get('q') || ''
    
    // Search State
    const [searchQuery, setSearchQuery] = useState(initialQuery)
    const [searchResults, setSearchResults] = useState([])
    const [searchTotalCount, setSearchTotalCount] = useState(0)
    const [searchPage, setSearchPage] = useState(1)
    
    // Hub State
    const [featuredArticle, setFeaturedArticle] = useState(null)
    const [latestArticles, setLatestArticles] = useState([])
    const [popularArticles, setPopularArticles] = useState([])
    const [categories, setCategories] = useState([])
    const [isHubLoading, setIsHubLoading] = useState(true)

    const PAGE_SIZE = 12

    // Apply SEO
    useEffect(() => {
        window.scrollTo(0, 0)
        setDocumentTitle("Insights | Blackpool")
        upsertMeta({ name: "description", content: "Helping businesses grow online through websites, SEO, branding and AI." })
        upsertLink({ rel: "canonical", href: `${CANONICAL_ORIGIN}/blog` })
    }, [])

    useEffect(() => {
        const loadHubContent = async () => {
            if (searchQuery) return // Don't load hub content if searching
            
            setIsHubLoading(true)
            try {
                const [featuredRes, latestRes, popularRes, cats] = await Promise.all([
                    fetchFeaturedArticles(1),
                    fetchLatestArticles(6),
                    fetchPopularArticles(3),
                    fetchCategories()
                ])
                
                if (featuredRes.articles.length > 0) {
                    setFeaturedArticle(featuredRes.articles[0])
                }
                setLatestArticles(latestRes.articles)
                setPopularArticles(popularRes.articles)
                setCategories(cats)
            } catch (err) {
                console.error("Failed to load hub content", err)
            } finally {
                setIsHubLoading(false)
            }
        }

        loadHubContent()
    }, [searchQuery])

    useEffect(() => {
        const loadSearchContent = async () => {
            if (!searchQuery) return

            if (window.gtag && searchQuery.length > 2 && searchPage === 1) {
                window.gtag('event', 'search', { search_term: searchQuery })
            }
            
            const { articles, count } = await performSearch(searchQuery, { page: searchPage, limit: PAGE_SIZE })
            setSearchResults(articles)
            setSearchTotalCount(count)
        }

        loadSearchContent()
    }, [searchQuery, searchPage])

    const handleSearch = (q) => {
        setSearchQuery(q)
        setSearchPage(1)
        const newUrl = q ? `/blog?q=${encodeURIComponent(q)}` : '/blog'
        window.history.pushState({}, "", newUrl)
    }

    const renderHero = () => (
        <div className="row justify-content-center mb-5 pb-3">
            <div className="col-lg-8 text-center">
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 fw-medium mb-3">
                    <i className="fa-solid fa-bolt me-2"></i> 250+ minutes of expert insights
                </span>
                <h1 className="display-4 fw-bold mb-3 tracking-tight" style={{ color: '#1a1a1a', letterSpacing: '-1px' }}>
                    Insights
                </h1>
                <p className="lead text-muted mb-5">
                    Helping businesses grow online through websites, SEO, branding and AI.
                </p>
                <BlogSearch initialQuery={searchQuery} onSearch={handleSearch} />
            </div>
        </div>
    )

    const renderHubSkeletons = () => (
        <>
            <div className="mb-5">
                <h3 className="fw-bold mb-4 placeholder-glow"><span className="placeholder col-3"></span></h3>
                <ArticleCard.Skeleton variant="featured" />
            </div>
            <div className="mb-5">
                <h3 className="fw-bold mb-4 text-center placeholder-glow"><span className="placeholder col-2"></span></h3>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="placeholder rounded-pill" style={{width: '120px', height: '42px'}}></div>
                    ))}
                </div>
            </div>
            <div className="mb-5">
                <h3 className="fw-bold mb-4 placeholder-glow"><span className="placeholder col-2"></span></h3>
                <div className="row g-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="col-12 col-md-6 col-lg-4">
                            <ArticleCard.Skeleton />
                        </div>
                    ))}
                </div>
            </div>
        </>
    )

    const renderHub = () => {
        if (isHubLoading) return renderHubSkeletons()

        return (
            <>
                {/* Featured Article Section */}
                <div className="mb-5">
                    <h3 className="fw-bold mb-4">Featured Article</h3>
                    {featuredArticle ? (
                        <ArticleCard article={featuredArticle} variant="featured" navigate={navigate} />
                    ) : (
                        <div className="card bg-light border-0 rounded-4 p-5 text-center text-muted">
                            <i className="fa-regular fa-star fs-1 opacity-25 mb-3"></i>
                            <h5>No featured article available</h5>
                            <p className="mb-0 opacity-75">Check back later for our highlighted content.</p>
                        </div>
                    )}
                </div>

                {/* Browse by Topic Section */}
                <div className="mb-5 pb-4">
                    <h4 className="fw-bold mb-4 text-center">Browse by Topic</h4>
                    {categories.length > 0 ? (
                        <div className="d-flex flex-wrap gap-3 justify-content-center">
                            {categories.map(cat => (
                                <button 
                                    key={cat.id} 
                                    className="btn btn-light rounded-pill px-4 py-2 border text-dark shadow-sm d-flex align-items-center gap-2"
                                    style={{ transition: 'all 0.2s' }}
                                    onClick={() => navigate(`/blog/category/${cat.slug}`)}
                                    onMouseEnter={(e) => e.currentTarget.classList.add('bg-white')}
                                    onMouseLeave={(e) => e.currentTarget.classList.remove('bg-white')}
                                >
                                    <span className="fw-medium">{cat.name}</span>
                                    <span className="badge bg-secondary bg-opacity-25 text-dark rounded-pill">
                                        {cat.count || 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted">No topics found.</p>
                    )}
                </div>

                {/* Latest Insights Section */}
                <div className="mb-5 pb-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="fw-bold m-0">Latest Insights</h3>
                        {latestArticles.length > 0 && (
                            <button className="btn btn-link text-decoration-none fw-medium p-0" onClick={() => handleSearch('')}>
                                View All <i className="fa-solid fa-arrow-right ms-1"></i>
                            </button>
                        )}
                    </div>
                    {latestArticles.length > 0 ? (
                        <div className="row g-4">
                            {latestArticles.map(article => (
                                <div key={article.id} className="col-12 col-md-6 col-lg-4">
                                    <ArticleCard article={article} navigate={navigate} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card bg-light border-0 rounded-4 p-5 text-center text-muted">
                            <i className="fa-regular fa-newspaper fs-1 opacity-25 mb-3"></i>
                            <h5>No recent articles</h5>
                            <p className="mb-0 opacity-75">We are currently writing new content.</p>
                        </div>
                    )}
                </div>

                {/* Popular Articles Section */}
                <div className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="fw-bold m-0">Popular Articles</h3>
                        {popularArticles.length > 0 && (
                            <button className="btn btn-link text-decoration-none fw-medium p-0" onClick={() => handleSearch('')}>
                                View All <i className="fa-solid fa-arrow-right ms-1"></i>
                            </button>
                        )}
                    </div>
                    {popularArticles.length > 0 ? (
                        <div className="row g-4">
                            {popularArticles.map(article => (
                                <div key={article.id} className="col-12 col-md-6 col-lg-4">
                                    <ArticleCard article={article} navigate={navigate} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card bg-light border-0 rounded-4 p-5 text-center text-muted">
                            <i className="fa-solid fa-fire fs-1 opacity-25 mb-3"></i>
                            <h5>No popular articles yet</h5>
                            <p className="mb-0 opacity-75">Articles will appear here as they gain traction.</p>
                        </div>
                    )}
                </div>
            </>
        )
    }

    const renderSearch = () => (
        <>
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold m-0">Search results for "{searchQuery}"</h5>
                <span className="text-muted small">{searchTotalCount} found</span>
            </div>

            {isSearching ? (
                <div className="row g-4 mb-4">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="col-12 col-md-6 col-lg-4">
                            <ArticleCard.Skeleton />
                        </div>
                    ))}
                </div>
            ) : searchResults.length > 0 ? (
                <>
                    <div className="row g-4 mb-4">
                        {searchResults.map(article => (
                            <div key={article.id} className="col-12 col-md-6 col-lg-4">
                                <ArticleCard article={article} navigate={navigate} />
                            </div>
                        ))}
                    </div>
                    <Pagination 
                        currentPage={searchPage} 
                        totalCount={searchTotalCount} 
                        pageSize={PAGE_SIZE} 
                        onPageChange={setSearchPage} 
                    />
                </>
            ) : (
                <div className="text-center py-5">
                    <div className="display-1 text-muted opacity-25 mb-4">
                        <i className="fa-solid fa-folder-open"></i>
                    </div>
                    <h3 className="fw-bold text-muted mb-3">No articles found</h3>
                    <p className="text-muted mb-4">We couldn't find anything matching "{searchQuery}".</p>
                    <button className="btn btn-primary px-4 py-2" onClick={() => handleSearch('')}>
                        Clear Search
                    </button>
                </div>
            )}
        </>
    )

    return (
        <div className="container py-5 pb-5">
            {renderHero()}

            {searchQuery ? renderSearch() : renderHub()}

            <div className="mt-5 pt-4">
                <NewsletterSignup />
            </div>
        </div>
    )
}
