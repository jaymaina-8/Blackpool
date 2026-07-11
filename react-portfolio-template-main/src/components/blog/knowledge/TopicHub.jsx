import React, { useState, useEffect } from 'react'
import { supabase } from '/src/utils/supabase.js'
import SeoManager from '/src/seo/SeoManager.jsx'

export default function TopicHub({ slug, navigate }) {
    const [topic, setTopic] = useState(null)
    const [articles, setArticles] = useState([])
    const [pillarArticle, setPillarArticle] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTopic = async () => {
            setLoading(true)
            
            // Fetch Category / Topic
            const { data: topicData } = await supabase.from('categories').select('*').eq('slug', slug).single()
            
            if (topicData) {
                setTopic(topicData)
                
                // Fetch Articles for this Topic
                const { data: articlesData } = await supabase
                    .from('articles')
                    .select('*, author:authors(name, avatar_url)')
                    .eq('category_id', topicData.id)
                    .eq('status', 'published')
                    .order('published_at', { ascending: false })
                
                if (articlesData) {
                    const pillar = articlesData.find(a => a.is_pillar)
                    const others = articlesData.filter(a => !a.is_pillar)
                    setPillarArticle(pillar || null)
                    setArticles(others)
                }
            }
            setLoading(false)
        }
        fetchTopic()
    }, [slug])

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>
    if (!topic) return <div className="p-5 text-center"><h2>Topic not found</h2></div>

    return (
        <div className="topic-hub pb-5">
            <SeoManager 
                title={topic.seo_title || `${topic.name} Insights & Strategies`}
                description={topic.seo_description || topic.hero_description || `Explore our comprehensive guides on ${topic.name}`}
            />
            
            {/* Topic Hero */}
            <div className="bg-dark text-white py-5 mb-5 border-bottom">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb mb-3">
                                    <li className="breadcrumb-item"><a href="/" className="text-white-50 text-decoration-none">Home</a></li>
                                    <li className="breadcrumb-item"><a href="/knowledge" className="text-white-50 text-decoration-none" onClick={(e) => {e.preventDefault(); navigate('/knowledge')}}>Insights</a></li>
                                    <li className="breadcrumb-item active text-white" aria-current="page">{topic.name}</li>
                                </ol>
                            </nav>
                            <h1 className="display-4 fw-bold mb-3">{topic.name}</h1>
                            <p className="lead opacity-75 mb-4" style={{maxWidth: '700px'}}>
                                {topic.hero_description || `Master ${topic.name.toLowerCase()} with our curated collection of strategies, guides, and tutorials designed to accelerate your growth.`}
                            </p>
                            <div className="d-flex gap-3 align-items-center opacity-75 small fw-bold text-uppercase tracking-wider">
                                <span><i className="fa-solid fa-file-lines me-2"></i>{articles.length + (pillarArticle ? 1 : 0)} Articles</span>
                                <span>•</span>
                                <span><i className="fa-solid fa-clock me-2"></i>Updated Weekly</span>
                            </div>
                        </div>
                        <div className="col-lg-4 text-center d-none d-lg-block">
                            <i className={`${topic.icon || 'fa-solid fa-folder'} opacity-25`} style={{fontSize: '8rem'}}></i>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="row g-5">
                    {/* Main Content Area */}
                    <div className="col-lg-8">
                        {/* Featured Pillar Guide */}
                        {pillarArticle && (
                            <div className="mb-5">
                                <h4 className="fw-bold mb-4 d-flex align-items-center">
                                    <i className="fa-solid fa-star text-warning me-2"></i> Complete Guide
                                </h4>
                                <div 
                                    className="card border-0 shadow-sm rounded-4 overflow-hidden cursor-pointer hover-lift border-primary border-start border-4"
                                    onClick={() => navigate(`/blog/${pillarArticle.slug}`)}
                                >
                                    <div className="card-body p-4 p-md-5">
                                        <div className="badge bg-primary text-white mb-3">Featured Pillar</div>
                                        <h2 className="fw-bold text-dark mb-3">{pillarArticle.title}</h2>
                                        <p className="text-muted mb-4">{pillarArticle.seo_description}</p>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center">
                                                {pillarArticle.author?.avatar_url ? (
                                                    <img src={pillarArticle.author.avatar_url} className="rounded-circle me-2" width="32" height="32" alt={pillarArticle.author.name} />
                                                ) : (
                                                    <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '32px', height: '32px'}}>
                                                        {pillarArticle.author?.name?.charAt(0) || 'A'}
                                                    </div>
                                                )}
                                                <span className="small text-muted fw-medium">{pillarArticle.author?.name || 'Author'}</span>
                                            </div>
                                            <span className="text-primary fw-bold">Read Guide <i className="fa-solid fa-arrow-right ms-1"></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Article List */}
                        <div className="mb-5">
                            <h4 className="fw-bold mb-4">Latest Articles in {topic.name}</h4>
                            <div className="row g-4">
                                {articles.map(article => (
                                    <div className="col-md-6" key={article.id}>
                                        <div 
                                            className="card h-100 border-0 shadow-sm rounded-4 cursor-pointer hover-lift"
                                            onClick={() => navigate(`/blog/${article.slug}`)}
                                        >
                                            <div className="card-body p-4 d-flex flex-column">
                                                <h5 className="fw-bold text-dark mb-3">{article.title}</h5>
                                                <p className="text-muted small mb-4 flex-grow-1 line-clamp-3">
                                                    {article.seo_description}
                                                </p>
                                                <div className="text-primary small fw-bold">
                                                    Read Article <i className="fa-solid fa-arrow-right ms-1"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {articles.length === 0 && !pillarArticle && (
                                    <div className="col-12 text-center py-5 bg-white rounded-4 border">
                                        <i className="fa-solid fa-pen-nib text-muted mb-3" style={{fontSize: '2rem'}}></i>
                                        <p className="text-muted m-0">No articles published in this topic yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar (Newsletter & Navigation) */}
                    <div className="col-lg-4">
                        <div className="card bg-primary text-white border-0 shadow-sm rounded-4 mb-4 sticky-top" style={{top: '100px'}}>
                            <div className="card-body p-4 p-md-5 text-center">
                                <i className="fa-solid fa-envelope-open-text mb-3 opacity-75" style={{fontSize: '2rem'}}></i>
                                <h4 className="fw-bold mb-3">Get {topic.name} Tips Delivered</h4>
                                <p className="small opacity-75 mb-4">Join 1,200+ founders receiving our best strategies every week.</p>
                                <form className="d-flex flex-column gap-2" onSubmit={e => e.preventDefault()}>
                                    <input type="email" className="form-control rounded-pill border-0 px-4 py-2" placeholder="Your email address" required />
                                    <button type="submit" className="btn btn-dark rounded-pill fw-bold">Subscribe</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
