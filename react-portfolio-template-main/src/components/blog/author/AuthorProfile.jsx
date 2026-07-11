import React, { useEffect, useState } from 'react'
import { useAuthors } from '/src/hooks/useAuthors.js'
import { track, EVENTS } from '/src/utils/analytics/index.js'
import { upsertJsonLd, upsertMeta, setDocumentTitle } from '/src/seo/domHead.js'
import { CANONICAL_ORIGIN } from '/src/seo/seoConfig.js'
import AuthorHero from './AuthorHero.jsx'
import AuthorStats from './AuthorStats.jsx'
import AuthorArticles from './AuthorArticles.jsx'

export default function AuthorProfile({ slug }) {
    const [page, setPage] = useState(() => {
        const params = new URLSearchParams(window.location.search)
        return parseInt(params.get('page') || '1', 10)
    })
    const [totalPages, setTotalPages] = useState(1)

    const { author, articles, stats, loading, error, fetchAuthorBySlug } = useAuthors()

    const handlePageChange = (p) => {
        setPage(p)
        const url = new URL(window.location)
        url.searchParams.set('page', p)
        window.history.pushState({}, '', url)
        window.scrollTo(0, 0)
    }

    useEffect(() => {
        if (slug) {
            fetchAuthorBySlug(slug, page).then(res => {
                if (res?.totalPages) setTotalPages(res.totalPages)
            })
        }
    }, [slug, page, fetchAuthorBySlug])

    useEffect(() => {
        if (author) {
            track(EVENTS.AUTHOR_PROFILE_VIEWED, { author_id: author.id, author_slug: author.slug })
            
            // SEO & Schema
            setDocumentTitle(author.seo_title || `${author.name} - Author Profile | Blackpool Industry`)
            upsertMeta({ name: "description", content: author.seo_description || author.bio || `Read articles written by ${author.name}` })
            upsertMeta({ property: "og:title", content: author.seo_title || `${author.name} - Author Profile` })
            
            const profileUrl = `${CANONICAL_ORIGIN}/blog/author/${author.slug}`
            
            const socials = [author.twitter, author.linkedin, author.github, author.website].filter(Boolean)
            
            const jsonLd = {
                "@context": "https://schema.org",
                "@type": "Person",
                "name": author.name,
                "url": profileUrl,
                "image": author.avatar_url,
                "jobTitle": author.job_title,
                "worksFor": {
                    "@type": "Organization",
                    "name": author.company || "Blackpool Industry"
                },
                "sameAs": socials
            }
            upsertJsonLd({ id: "seo-jsonld-author", json: jsonLd })
        }
    }, [author])

    if (loading) return (
        <div className="container py-5 mt-5 text-center">
            <span className="spinner-border text-primary" role="status"></span>
        </div>
    )

    if (error || !author) return (
        <div className="container py-5 mt-5 text-center">
            <h1 className="fw-bold tracking-tight">Author Not Found</h1>
            <p className="text-muted">The author profile you are looking for does not exist.</p>
        </div>
    )

    return (
        <div className="container py-5 mt-5" style={{ maxWidth: '900px' }}>
            <AuthorHero author={author} />
            <AuthorStats stats={stats} />
            <AuthorArticles 
                articles={articles} 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={handlePageChange}
            />
        </div>
    )
}
