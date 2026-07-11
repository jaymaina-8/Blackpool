import React from 'react'
import AuthorSocials from './AuthorSocials.jsx'
import AuthorBadge from './AuthorBadge.jsx'

export default function AuthorHero({ author }) {
    if (!author) return null

    return (
        <div className="py-5 bg-light rounded-4 mb-5 text-center px-4">
            <div className="position-relative d-inline-block mb-4">
                <img 
                    src={author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=random`} 
                    alt={author.name} 
                    className="rounded-circle shadow-sm"
                    style={{ width: '120px', height: '120px', objectFit: 'cover', border: '4px solid white' }}
                />
                {author.featured && (
                    <span className="position-absolute bottom-0 end-0 translate-middle p-2 bg-success border border-light rounded-circle" title="Featured Author">
                        <span className="visually-hidden">Featured</span>
                    </span>
                )}
            </div>
            
            <h1 className="fw-bold mb-2 tracking-tight d-flex align-items-center justify-content-center gap-2">
                {author.name}
                {author.verified && (
                    <span className="text-primary fs-5" title="Verified Author">
                        <i className="fa-solid fa-circle-check"></i>
                    </span>
                )}
            </h1>
            
            <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                <p className="text-muted fw-medium m-0">
                    {author.job_title} {author.company && `at ${author.company}`}
                </p>
            </div>

            <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                {author.badges?.map((badge, idx) => (
                    <AuthorBadge key={idx} badge={badge} />
                ))}
            </div>

            {author.bio && (
                <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: '600px' }}>
                    {author.bio}
                </p>
            )}

            <AuthorSocials author={author} />
        </div>
    )
}
