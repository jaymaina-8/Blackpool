import React, { useEffect, useState } from 'react'
import ArticleShare from './ArticleShare.jsx'

export default function ReadingProgress({ readTimeMinutes, articleUrl, articleTitle }) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const update = () => {
            const currentScrollY = window.scrollY
            const scrollHeight = document.body.scrollHeight - window.innerHeight
            if(scrollHeight > 0) {
                setProgress(Math.min(100, Math.max(0, (currentScrollY / scrollHeight) * 100)))
            }
        }
        window.addEventListener('scroll', update, { passive: true })
        // Initial call
        update()
        return () => window.removeEventListener('scroll', update)
    }, [])

    const minutesRemaining = Math.max(1, Math.ceil(readTimeMinutes * (1 - (progress / 100))))

    return (
        <div className="fixed-top bg-white border-bottom shadow-sm" style={{ zIndex: 1050 }}>
            <div 
                className="bg-primary" 
                style={{ 
                    height: '4px',
                    width: `${progress}%`, 
                    transition: 'width 0.1s cubic-bezier(0.4, 0, 0.2, 1)' 
                }} 
            />
            
            {/* Mobile Sticky Bar */}
            <div className="d-xl-none px-3 py-2 d-flex align-items-center justify-content-between">
                <div className="text-muted small fw-medium">
                    {progress > 95 ? (
                        <span className="text-success"><i className="fa-solid fa-check me-1"></i> Completed</span>
                    ) : (
                        <span><i className="fa-regular fa-clock me-1"></i> ≈ {minutesRemaining} min remaining</span>
                    )}
                </div>
                <div className="d-flex align-items-center gap-2">
                    <ArticleShare url={articleUrl} title={articleTitle} mobileCompact={true} />
                </div>
            </div>
            
            {/* Desktop floating info (optional, or we just leave it minimal) */}
            <div className="d-none d-xl-block position-absolute end-0 top-0 mt-3 me-3">
                {progress > 5 && progress < 95 && (
                    <div className="badge bg-light text-muted border px-3 py-2 rounded-pill shadow-sm">
                        <i className="fa-regular fa-clock me-1"></i> ≈ {minutesRemaining} min remaining
                    </div>
                )}
            </div>
        </div>
    )
}
