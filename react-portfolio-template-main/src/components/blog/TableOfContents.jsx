import React, { useEffect, useState } from 'react'

export default function TableOfContents({ htmlContent }) {
    const [headings, setHeadings] = useState([])
    const [activeId, setActiveId] = useState('')

    useEffect(() => {
        if (!htmlContent) return

        // Parse headings from the rendered DOM instead of regex
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlContent, 'text/html')
        const hTags = doc.querySelectorAll('h2, h3')
        
        const extracted = Array.from(hTags).map(tag => {
            // Generate an ID if BlockNote didn't assign one
            const text = tag.textContent || ''
            const id = tag.id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
            return { id, text, level: tag.tagName === 'H3' ? 3 : 2 }
        })
        
        setHeadings(extracted)
    }, [htmlContent])

    useEffect(() => {
        // Wait for actual DOM nodes to exist
        const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean)
        
        if (headingElements.length === 0) return

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveId(entry.target.id)
                }
            })
        }, { rootMargin: '0px 0px -80% 0px' })

        headingElements.forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [headings])

    const scrollTo = (id) => {
        const el = document.getElementById(id)
        if (el) {
            const y = el.getBoundingClientRect().top + window.pageYOffset - 100
            window.scrollTo({ top: y, behavior: 'smooth' })
        }
    }

    if (headings.length === 0) return null

    return (
        <nav className="toc-container p-4 bg-light rounded-4 border-0 shadow-sm" style={{ fontSize: '0.95rem' }}>
            <h6 className="fw-bold mb-4 text-uppercase text-muted" style={{ letterSpacing: '1px', fontSize: '0.8rem' }}>On This Page</h6>
            <ul className="list-unstyled mb-0">
                {headings.map(h => (
                    <li key={h.id} className={`mb-3 ${h.level === 3 ? 'ms-3' : ''}`}>
                        <button 
                            onClick={() => scrollTo(h.id)} 
                            className={`btn btn-link p-0 text-start text-decoration-none ${activeId === h.id ? 'active' : 'text-muted'}`}
                            style={{ transition: 'color 0.2s', whiteSpace: 'normal', textAlign: 'left', lineHeight: '1.4' }}
                        >
                            {h.text}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
