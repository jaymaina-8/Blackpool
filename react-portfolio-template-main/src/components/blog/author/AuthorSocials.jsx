import React from 'react'
import { track, EVENTS } from '/src/utils/analytics/index.js'

export default function AuthorSocials({ author }) {
    if (!author) return null

    const handleSocialClick = (network, url) => {
        track(EVENTS.SOCIAL_LINK_CLICKED, { author_id: author.id, network, url })
    }

    const socials = [
        { key: 'twitter', icon: 'fa-twitter', url: author.twitter, color: 'text-info' },
        { key: 'linkedin', icon: 'fa-linkedin-in', url: author.linkedin, color: 'text-primary' },
        { key: 'github', icon: 'fa-github', url: author.github, color: 'text-dark' },
        { key: 'website', icon: 'fa-link', url: author.website, color: 'text-secondary' },
        { key: 'email', icon: 'fa-envelope', url: author.email ? `mailto:${author.email}` : null, color: 'text-danger' }
    ].filter(s => s.url)

    if (socials.length === 0) return null

    return (
        <div className="d-flex justify-content-center gap-3">
            {socials.map(s => (
                <a 
                    key={s.key} 
                    href={s.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center shadow-sm ${s.color}`}
                    style={{ width: '40px', height: '40px' }}
                    onClick={() => handleSocialClick(s.key, s.url)}
                    aria-label={`${author.name} on ${s.key}`}
                >
                    <i className={`${s.key === 'website' || s.key === 'email' ? 'fa-solid' : 'fa-brands'} ${s.icon} fs-5`}></i>
                </a>
            ))}
        </div>
    )
}
