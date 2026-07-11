import React from 'react'
import { authorConfig } from '/src/config/authorConfig.js'
import { track, EVENTS } from '/src/utils/analytics/index.js'

export default function AuthorCard({ author }) {
    const avatar = author?.avatar_url || authorConfig.defaultAvatar
    const name = author?.full_name || author?.name || authorConfig.companyName
    const bio = author?.bio || authorConfig.bio
    const slug = author?.slug
    const role = author?.job_title
    const company = author?.company

    return (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
            <div className="card-body p-5 d-flex flex-column flex-md-row gap-4 align-items-center align-items-md-start">
                <div className="flex-shrink-0">
                    <img 
                        src={avatar} 
                        alt={`Profile picture of ${name}`} 
                        className="rounded-circle shadow-sm object-fit-cover" 
                        width="96" 
                        height="96" 
                    />
                </div>
                <div className="text-center text-md-start flex-grow-1">
                    <div className="d-flex justify-content-between align-items-md-start flex-column flex-md-row">
                        <div>
                            <h4 className="fw-bold mb-1">{name}</h4>
                            {(role || company) && (
                                <p className="text-muted small fw-medium text-uppercase tracking-wider mb-2">
                                    {role} {company && `at ${company}`}
                                </p>
                            )}
                        </div>
                        {slug && (
                            <a 
                                href={`/blog/author/${slug}`} 
                                className="btn btn-sm btn-outline-primary rounded-pill mt-2 mt-md-0"
                                onClick={() => track(EVENTS.AUTHOR_PROFILE_VIEWED, { source: 'author_card', author_slug: slug })}
                            >
                                View Profile
                            </a>
                        )}
                    </div>
                    
                    <p className="text-muted mb-3 lh-lg mt-2">{bio}</p>
                    
                    <div className="d-flex gap-3 justify-content-center justify-content-md-start">
                        {/* Prefer database socials, fallback to config */}
                        {(author?.twitter || author?.linkedin || author?.github) ? (
                            <>
                                {author.twitter && (
                                    <a href={author.twitter} className="text-info text-decoration-none" target="_blank" rel="noopener noreferrer" onClick={() => track(EVENTS.SOCIAL_LINK_CLICKED, { network: 'twitter' })}>
                                        <i className="fa-brands fa-twitter fs-5"></i>
                                    </a>
                                )}
                                {author.linkedin && (
                                    <a href={author.linkedin} className="text-primary text-decoration-none" target="_blank" rel="noopener noreferrer" onClick={() => track(EVENTS.SOCIAL_LINK_CLICKED, { network: 'linkedin' })}>
                                        <i className="fa-brands fa-linkedin-in fs-5"></i>
                                    </a>
                                )}
                                {author.github && (
                                    <a href={author.github} className="text-dark text-decoration-none" target="_blank" rel="noopener noreferrer" onClick={() => track(EVENTS.SOCIAL_LINK_CLICKED, { network: 'github' })}>
                                        <i className="fa-brands fa-github fs-5"></i>
                                    </a>
                                )}
                            </>
                        ) : (
                            authorConfig.socialLinks.map((social, index) => (
                                <a 
                                    key={index}
                                    href={social.url} 
                                    className="text-muted text-decoration-none" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    aria-label={`Follow on ${social.platform}`}
                                    onClick={() => track(EVENTS.AUTHOR_CARD_INTERACTION, { platform: social.platform })}
                                >
                                    <i className={`${social.icon} fs-5`}></i>
                                </a>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
