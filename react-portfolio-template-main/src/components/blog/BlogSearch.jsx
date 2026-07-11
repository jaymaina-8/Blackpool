import React, { useState, useEffect } from 'react'

export default function BlogSearch({ initialQuery = '', onSearch }) {
    const [query, setQuery] = useState(initialQuery)

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onSearch(query)
        }, 300)
        return () => clearTimeout(timeoutId)
    }, [query, onSearch])

    return (
        <div className="search-bar mb-4 position-relative">
            <i className="fa-solid fa-search position-absolute text-muted" style={{ top: '50%', left: '16px', transform: 'translateY(-50%)' }}></i>
            <input 
                type="text" 
                className="form-control form-control-lg bg-white border-0 shadow-sm ps-5 rounded-pill" 
                placeholder="Search articles, categories, tags..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search articles"
            />
            {query && (
                <button 
                    className="btn btn-link position-absolute text-muted text-decoration-none" 
                    style={{ top: '50%', right: '12px', transform: 'translateY(-50%)' }}
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                >
                    <i className="fa-solid fa-times"></i>
                </button>
            )}
        </div>
    )
}
