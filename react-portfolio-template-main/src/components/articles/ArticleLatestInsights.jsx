import React, { useEffect, useState } from 'react'
import Article from "/src/components/articles/base/Article.jsx"
import ArticleCard from "/src/components/blog/ArticleCard.jsx"
import { usePublicArticles } from "/src/hooks/usePublicArticles.js"
import { useApi } from "/src/hooks/api.js"
import { track, EVENTS } from '/src/utils/analytics/index.js'

export default function ArticleLatestInsights({ dataWrapper, id }) {
    const { fetchFeaturedArticles, fetchPopularArticles, fetchLatestArticles } = usePublicArticles()
    const api = useApi()
    const [articles, setArticles] = useState(null) // null implies loading
    const [selectedItemCategoryId, setSelectedItemCategoryId] = useState(null)

    useEffect(() => {
        const load = async () => {
            // Fetch articles concurrently
            const [featuredRes, popularRes, latestRes] = await Promise.all([
                fetchFeaturedArticles(1),
                fetchPopularArticles(2), // Fetch 2 just in case popular is the same as featured
                fetchLatestArticles(3)   // Fetch 3 just in case latest overlaps with featured/popular
            ])

            const selectedArticles = []
            const seenIds = new Set()

            // 1. Add Featured
            if (featuredRes?.articles?.length > 0) {
                const featured = featuredRes.articles[0]
                featured.customBadge = (
                    <span className="badge bg-warning text-dark shadow-sm px-3 py-2 rounded-pill fs-6">
                        <i className="fa-solid fa-star me-1"></i> Featured Insight
                    </span>
                )
                selectedArticles.push(featured)
                seenIds.add(featured.id)
            }

            // 2. Add Popular
            const popular = popularRes?.articles?.find(a => !seenIds.has(a.id))
            if (popular) {
                popular.customBadge = (
                    <span className="badge bg-primary text-white shadow-sm px-3 py-2 rounded-pill">
                        <i className="fa-solid fa-fire me-1"></i> Most Helpful Guide
                    </span>
                )
                selectedArticles.push(popular)
                seenIds.add(popular.id)
            }

            // 3. Add Latest
            const latest = latestRes?.articles?.find(a => !seenIds.has(a.id))
            if (latest) {
                latest.customBadge = (
                    <span className="badge bg-success text-white shadow-sm px-3 py-2 rounded-pill">
                        <i className="fa-solid fa-bolt me-1"></i> New
                    </span>
                )
                selectedArticles.push(latest)
                seenIds.add(latest.id)
            }

            // Fallback: If we don't have 3 articles yet, fill with remaining latest
            if (selectedArticles.length < 3 && latestRes?.articles) {
                for (const article of latestRes.articles) {
                    if (selectedArticles.length >= 3) break;
                    if (!seenIds.has(article.id)) {
                        selectedArticles.push(article)
                        seenIds.add(article.id)
                    }
                }
            }

            setArticles(selectedArticles)
        }
        load()
    }, [])

    return (
        <Article 
            id={dataWrapper.uniqueId}
            type={Article.Types.SPACING_DEFAULT}
            dataWrapper={dataWrapper}
            className={`article-latest-insights`}
            selectedItemCategoryId={selectedItemCategoryId}
            setSelectedItemCategoryId={setSelectedItemCategoryId}
        >
            <div className="row g-4 mb-4">
                {articles === null ? (
                    // Loading Skeletons
                    <>
                        <div className="col-md-4"><ArticleCard.Skeleton /></div>
                        <div className="col-md-4"><ArticleCard.Skeleton /></div>
                        <div className="col-md-4 d-none d-md-block"><ArticleCard.Skeleton /></div>
                    </>
                ) : articles.length > 0 ? (
                    // Loaded Articles
                    articles.map(article => (
                        <div key={article.id} className="col-md-4">
                            <ArticleCard 
                                article={article} 
                                navigate={(path) => window.location.assign(path)} 
                                customBadge={article.customBadge}
                            />
                        </div>
                    ))
                ) : (
                    // Empty State
                    <div className="col-12 text-center py-5 bg-light rounded-4 border">
                        <i className="fa-solid fa-newspaper text-muted fs-1 mb-3 opacity-50"></i>
                        <h5 className="fw-bold text-muted">No insights published yet</h5>
                        <p className="text-muted small mb-0">Check back later for our latest updates and articles.</p>
                    </div>
                )}
            </div>

            {/* View All CTA */}
            {articles !== null && articles.length > 0 && (
                <div className="text-center mt-5">
                    <button 
                        className="btn btn-outline-primary rounded-pill px-4 py-2 fw-medium border-2"
                        onClick={() => {
                            track(EVENTS.EXPLORE_ALL_INSIGHTS_CLICKED)
                            window.location.assign('/blog')
                        }}
                    >
                        Explore All Insights <i className="fa-solid fa-arrow-right ms-2"></i>
                    </button>
                </div>
            )}
        </Article>
    )
}
