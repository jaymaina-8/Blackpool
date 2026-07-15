import React, { useState, useEffect } from 'react'
import { useLocation } from '/src/providers/LocationProvider.jsx'

export default function GlobalSearch({ isOpen, onClose }) {
    const { goToAdminRoute } = useLocation()
    const [query, setQuery] = useState('')

    // Mock search results
    const allResults = [
        { title: 'Articles', path: '/articles', type: 'Section', icon: 'pi-file' },
        { title: 'Media Library', path: '/media', type: 'Section', icon: 'pi-image' },
        { title: 'Marketing Overview', path: '/marketing', type: 'Section', icon: 'pi-chart-line' },
        { title: 'Settings', path: '/settings', type: 'Section', icon: 'pi-cog' },
        { title: 'Knowledge Hub', path: '/topics', type: 'Section', icon: 'pi-sitemap' },
        { title: 'Categories', path: '/categories', type: 'Section', icon: 'pi-tags' },
        { title: 'CTAs', path: '/marketing/ctas', type: 'Section', icon: 'pi-bullseye' },
    ]

    const filteredResults = query 
        ? allResults.filter(r => r.title.toLowerCase().includes(query.toLowerCase()))
        : []

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault()
                // Toggle logic handled in parent, this just prevents default browser action
            }
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content admin-card p-0 overflow-hidden" style={{ border: 'none' }}>
                    <div className="p-3 border-bottom d-flex align-items-center gap-3">
                        <i className="pi pi-search text-muted fs-5"></i>
                        <input 
                            autoFocus
                            type="text" 
                            className="form-control border-0 shadow-none p-0 fs-5" 
                            placeholder="Search everything..." 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{ backgroundColor: 'transparent', color: 'var(--admin-text-main)' }}
                        />
                        <button className="btn btn-sm admin-btn-ghost" onClick={onClose}>ESC</button>
                    </div>
                    {query && (
                        <div className="p-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {filteredResults.length > 0 ? (
                                filteredResults.map((result, idx) => (
                                    <button 
                                        key={idx}
                                        className="btn w-100 text-start d-flex align-items-center justify-content-between p-3 rounded"
                                        onClick={() => {
                                            goToAdminRoute(result.path)
                                            onClose()
                                        }}
                                        style={{ color: 'var(--admin-text-main)', border: 'none', backgroundColor: 'transparent' }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-bg-sidebar)'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <span className="d-flex align-items-center gap-3">
                                            <i className={`pi ${result.icon} text-muted`}></i>
                                            {result.title}
                                        </span>
                                        <span className="badge" style={{ backgroundColor: 'var(--admin-bg-sidebar)', color: 'var(--admin-text-main)' }}>{result.type}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-muted">
                                    No results found for "{query}"
                                </div>
                            )}
                        </div>
                    )}
                    {!query && (
                        <div className="p-4 text-center text-muted admin-small-text">
                            Type to search for articles, settings, or media...
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
