import React from 'react'

export default function ArticleShare({ url, title, className = '', mobileCompact = false }) {
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    url: url
                })
            } catch (err) {
                console.error('Error sharing:', err)
            }
        } else {
            handleCopyLink()
        }
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(url)
        // Note: Could add a small toast notification here
        alert('Link copied to clipboard!')
    }

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`
    }

    // On mobile we might just show a "Share" button if navigator.share exists, but the user requested explicit buttons.
    // We will show explicit buttons and optionally the native share on mobile.

    const buttonClass = "btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center border"
    const style = { width: mobileCompact ? '36px' : '42px', height: mobileCompact ? '36px' : '42px', transition: 'all 0.2s' }

    return (
        <div className={`d-flex flex-wrap gap-2 ${className}`}>
            {!mobileCompact && (
                <>
                    <a 
                        href={shareLinks.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={buttonClass}
                        style={style}
                        aria-label="Share on Facebook"
                        onMouseEnter={(e) => e.currentTarget.classList.add('bg-white')}
                        onMouseLeave={(e) => e.currentTarget.classList.remove('bg-white')}
                    >
                        <i className="fa-brands fa-facebook-f text-primary"></i>
                    </a>
                    <a 
                        href={shareLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={buttonClass}
                        style={style}
                        aria-label="Share on X (Twitter)"
                        onMouseEnter={(e) => e.currentTarget.classList.add('bg-white')}
                        onMouseLeave={(e) => e.currentTarget.classList.remove('bg-white')}
                    >
                        <i className="fa-brands fa-x-twitter text-dark"></i>
                    </a>
                    <a 
                        href={shareLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={buttonClass}
                        style={style}
                        aria-label="Share on LinkedIn"
                        onMouseEnter={(e) => e.currentTarget.classList.add('bg-white')}
                        onMouseLeave={(e) => e.currentTarget.classList.remove('bg-white')}
                    >
                        <i className="fa-brands fa-linkedin-in text-primary"></i>
                    </a>
                </>
            )}
            <a 
                href={shareLinks.whatsapp} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`${buttonClass} d-xl-none`} // Usually more useful on mobile
                style={style}
                aria-label="Share on WhatsApp"
                onMouseEnter={(e) => e.currentTarget.classList.add('bg-white')}
                onMouseLeave={(e) => e.currentTarget.classList.remove('bg-white')}
            >
                <i className="fa-brands fa-whatsapp text-success"></i>
            </a>
            <button 
                onClick={handleCopyLink} 
                className={buttonClass}
                style={style}
                aria-label="Copy Link"
                title="Copy Link"
                onMouseEnter={(e) => e.currentTarget.classList.add('bg-white')}
                onMouseLeave={(e) => e.currentTarget.classList.remove('bg-white')}
            >
                <i className="fa-solid fa-link text-muted"></i>
            </button>
            {/* Native share for supported devices */}
            {typeof navigator !== 'undefined' && navigator.share && (
                <button 
                    onClick={handleShare} 
                    className={buttonClass}
                    style={style}
                    aria-label="Native Share"
                    title="Share..."
                >
                    <i className="fa-solid fa-share-nodes text-dark"></i>
                </button>
            )}
        </div>
    )
}
