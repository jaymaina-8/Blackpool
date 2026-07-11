import React, { useEffect } from 'react'

export default function ArticleLightbox({ images, currentIndex, onClose, onNavigate }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') onNavigate(-1)
            if (e.key === 'ArrowRight') onNavigate(1)
        }
        window.addEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'hidden' // prevent scrolling
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [onClose, onNavigate])

    if (!images || images.length === 0 || currentIndex < 0) return null

    const currentImage = images[currentIndex]

    return (
        <div 
            className="article-lightbox position-fixed w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center"
            style={{ 
                zIndex: 1070, 
                backgroundColor: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(10px)',
                animation: 'fadeIn 0.2s ease-out forwards',
                cursor: 'zoom-out'
            }}
            onClick={onClose}
        >
            <button 
                className="btn btn-dark rounded-circle position-absolute border-secondary shadow" 
                style={{ top: '20px', right: '20px', width: '44px', height: '44px', zIndex: 1071 }}
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                aria-label="Close"
            >
                <i className="fa-solid fa-times"></i>
            </button>

            {images.length > 1 && (
                <>
                    <button 
                        className="btn btn-dark rounded-circle position-absolute border-secondary shadow d-none d-md-flex align-items-center justify-content-center" 
                        style={{ left: '20px', width: '48px', height: '48px', zIndex: 1071 }}
                        onClick={(e) => { e.stopPropagation(); onNavigate(-1); }}
                        aria-label="Previous image"
                    >
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button 
                        className="btn btn-dark rounded-circle position-absolute border-secondary shadow d-none d-md-flex align-items-center justify-content-center" 
                        style={{ right: '20px', width: '48px', height: '48px', zIndex: 1071 }}
                        onClick={(e) => { e.stopPropagation(); onNavigate(1); }}
                        aria-label="Next image"
                    >
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </>
            )}

            <div className="position-relative text-center" style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
                <img 
                    src={currentImage.src} 
                    alt={currentImage.alt || 'Expanded view'} 
                    className="img-fluid shadow-lg rounded"
                    style={{ 
                        maxHeight: '85vh', 
                        objectFit: 'contain',
                        animation: 'zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                    }} 
                    onClick={(e) => e.stopPropagation()} 
                />
                {images.length > 1 && (
                    <div className="text-white mt-3 small opacity-75 fw-medium">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes zoomIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    )
}
