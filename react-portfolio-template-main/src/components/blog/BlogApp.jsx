import React, { useEffect, useState } from 'react'
import BlogListing from './BlogListing.jsx'
import ArticlePage from './ArticlePage.jsx'
import CategoryPage from './CategoryPage.jsx'
import TagPage from './TagPage.jsx'
import AuthorProfile from './author/AuthorProfile.jsx'
import KnowledgeHub from './knowledge/KnowledgeHub.jsx'
import TopicHub from './knowledge/TopicHub.jsx'
import '/src/styles/blog.scss'

export default function BlogApp() {
    const [path, setPath] = useState(window.location.pathname)

    useEffect(() => {
        const handlePopState = () => {
            setPath(window.location.pathname)
        }
        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [])

    const navigate = (newPath) => {
        window.history.pushState({}, "", newPath)
        setPath(newPath)
    }

    // Header logic - Premium minimal header
    const BlogHeader = () => (
        <header className="blog-header py-3 px-4 border-bottom bg-white d-flex justify-content-between align-items-center sticky-top">
            <div className="d-flex align-items-center gap-2 cursor-pointer" onClick={() => navigate('/knowledge')}>
                <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center fw-bold" style={{width: '32px', height: '32px'}}>A</div>
                <h5 className="fw-bold m-0 tracking-tight">Insights</h5>
            </div>
            <div className="d-flex gap-3 align-items-center">
                <a href="/knowledge" className="text-decoration-none text-dark fw-medium small">Topics</a>
                <a href="/blog" className="text-decoration-none text-muted small">Latest</a>
                <a href="/" className="btn btn-sm btn-outline-secondary rounded-pill px-3 ms-2">
                    Back to Portfolio
                </a>
            </div>
        </header>
    )

    const isListing = path === '/blog' || path === '/blog/' || path.startsWith('/blog?q=')
    const isKnowledgeHub = path === '/knowledge' || path === '/knowledge/'
    
    // Extract slug from /blog/:slug or /knowledge/topic/:slug
    let articleSlug = null
    let categorySlug = null
    let tagSlug = null
    let authorSlug = null
    let topicSlug = null

    if (path.startsWith('/knowledge/topic/')) {
        topicSlug = path.replace('/knowledge/topic/', '').replace(/\/$/, '')
    } else if (path.startsWith('/blog/category/')) {
        categorySlug = path.replace('/blog/category/', '').replace(/\/$/, '')
    } else if (path.startsWith('/blog/tag/')) {
        tagSlug = path.replace('/blog/tag/', '').replace(/\/$/, '')
    } else if (path.startsWith('/blog/author/')) {
        authorSlug = path.replace('/blog/author/', '').replace(/\/$/, '')
    } else if (!isListing && !isKnowledgeHub && path.startsWith('/blog/')) {
        articleSlug = path.replace('/blog/', '').replace(/\/$/, '')
    } else if (!isListing && !isKnowledgeHub && path.startsWith('/knowledge/')) {
        articleSlug = path.replace('/knowledge/', '').replace(/\/$/, '')
    }

    return (
        <div className="blog-app bg-light min-vh-100 font-sans">
            <BlogHeader />
            <main>
                {isKnowledgeHub ? (
                    <KnowledgeHub navigate={navigate} />
                ) : topicSlug ? (
                    <TopicHub slug={topicSlug} navigate={navigate} />
                ) : isListing ? (
                    <BlogListing navigate={navigate} />
                ) : categorySlug ? (
                    <CategoryPage slug={categorySlug} navigate={navigate} />
                ) : tagSlug ? (
                    <TagPage slug={tagSlug} navigate={navigate} />
                ) : authorSlug ? (
                    <AuthorProfile slug={authorSlug} />
                ) : (
                    <ArticlePage slug={articleSlug} navigate={navigate} />
                )}
            </main>
            
            <footer className="blog-footer py-5 bg-dark text-white text-center mt-auto">
                <div className="container">
                    <p className="opacity-75 small m-0">&copy; {new Date().getFullYear()} Project Atlas. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
