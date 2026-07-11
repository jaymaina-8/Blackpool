import React, { useEffect, useState, useRef } from 'react'
import { track, EVENTS } from '/src/utils/analytics/index.js'

export default function ReadingCompletionCTA() {
    const [isVisible, setIsVisible] = useState(false)
    const [hasFired, setHasFired] = useState(false)
    const containerRef = useRef(null)

    useEffect(() => {
        const handleScroll = () => {
            if (hasFired) return

            // Calculate how far down the page we are
            // A simple proxy: if they reach near the bottom of the document
            const scrollY = window.scrollY
            const docHeight = document.documentElement.scrollHeight
            const winHeight = window.innerHeight

            // If user scrolled past 85% of the total page height, they likely finished reading the article body
            if (scrollY / (docHeight - winHeight) > 0.85) {
                setIsVisible(true)
                setHasFired(true)
                track(EVENTS.READING_COMPLETED)
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [hasFired])

    if (!isVisible) return null

    return (
        <div 
            ref={containerRef}
            className="fixed-bottom d-flex justify-content-center p-3 p-md-4" 
            style={{ 
                zIndex: 1040, 
                pointerEvents: 'none', 
                animation: 'slideUpFade 0.5s ease-out forwards' 
            }}
        >
            <style>{`
                @keyframes slideUpFade {
                    0% { transform: translateY(20px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
            `}</style>
            
            <div 
                className="bg-white rounded-pill shadow-lg border p-2 d-flex align-items-center gap-3"
                style={{ pointerEvents: 'auto', maxWidth: '100%', overflow: 'hidden' }}
            >
                <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ms-2" style={{ width: '32px', height: '32px' }}>
                    <i className="fa-solid fa-check small"></i>
                </div>
                <div className="text-dark small fw-medium d-none d-sm-block text-truncate">
                    You've reached the end. Ready to improve your business online?
                </div>
                <div className="text-dark small fw-medium d-block d-sm-none">
                    Ready to grow?
                </div>
                <a 
                    href="/contact" 
                    className="btn btn-primary btn-sm rounded-pill px-4 fw-medium flex-shrink-0"
                    onClick={() => track(EVENTS.CTA_CLICKED, { type: 'reading_completion' })}
                >
                    Talk to Us
                </a>
                <button 
                    className="btn btn-link text-muted p-0 ms-2 me-2" 
                    onClick={() => setIsVisible(false)}
                    aria-label="Close"
                >
                    <i className="fa-solid fa-times"></i>
                </button>
            </div>
        </div>
    )
}
