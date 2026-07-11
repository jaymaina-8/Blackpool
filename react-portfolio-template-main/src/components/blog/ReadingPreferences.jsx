import React, { useEffect, useState } from 'react'

export default function ReadingPreferences() {
    const [isOpen, setIsOpen] = useState(false)
    const [prefs, setPrefs] = useState({
        fontSize: 'default', // default, large, xlarge
        theme: 'light', // light, dark
        width: 'comfortable' // comfortable, wide
    })

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('blackpool_blog_prefs')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setPrefs(parsed)
                applyPrefs(parsed)
            } catch (e) {
                // ignore
            }
        }
    }, [])

    const applyPrefs = (newPrefs) => {
        const articleRoot = document.querySelector('.blog-article')
        if (!articleRoot) return

        // Theme
        if (newPrefs.theme === 'dark') {
            articleRoot.classList.add('theme-dark')
        } else {
            articleRoot.classList.remove('theme-dark')
        }

        // Font Size
        articleRoot.classList.remove('font-size-large', 'font-size-xlarge')
        if (newPrefs.fontSize === 'large') articleRoot.classList.add('font-size-large')
        if (newPrefs.fontSize === 'xlarge') articleRoot.classList.add('font-size-xlarge')

        // Width
        const contentContainer = document.querySelector('.article-content-container')
        if (contentContainer) {
            contentContainer.style.maxWidth = newPrefs.width === 'wide' ? '900px' : '740px'
        }
    }

    const updatePref = (key, value) => {
        const newPrefs = { ...prefs, [key]: value }
        setPrefs(newPrefs)
        localStorage.setItem('blackpool_blog_prefs', JSON.stringify(newPrefs))
        applyPrefs(newPrefs)
    }

    const increaseFont = () => {
        if (prefs.fontSize === 'default') updatePref('fontSize', 'large')
        else if (prefs.fontSize === 'large') updatePref('fontSize', 'xlarge')
    }

    const decreaseFont = () => {
        if (prefs.fontSize === 'xlarge') updatePref('fontSize', 'large')
        else if (prefs.fontSize === 'large') updatePref('fontSize', 'default')
    }

    return (
        <div className="position-relative">
            <button 
                className="btn btn-light rounded-circle shadow-sm border d-flex align-items-center justify-content-center"
                style={{ width: '42px', height: '42px' }}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Reading Preferences"
            >
                <i className="fa-solid fa-sliders text-muted"></i>
            </button>

            {isOpen && (
                <div 
                    className="position-absolute end-0 mt-2 bg-white rounded-4 shadow-sm border p-3" 
                    style={{ width: '250px', zIndex: 1060 }}
                >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="m-0 fw-bold small text-uppercase tracking-wider text-muted">Preferences</h6>
                        <button className="btn-close" style={{ fontSize: '10px' }} onClick={() => setIsOpen(false)}></button>
                    </div>

                    <div className="mb-3">
                        <div className="small text-muted mb-2">Text Size</div>
                        <div className="btn-group w-100 border rounded">
                            <button className="btn btn-light btn-sm" onClick={decreaseFont} disabled={prefs.fontSize === 'default'}><i className="fa-solid fa-minus"></i></button>
                            <div className="btn btn-light btn-sm w-100 disabled text-dark fw-medium">Aa</div>
                            <button className="btn btn-light btn-sm" onClick={increaseFont} disabled={prefs.fontSize === 'xlarge'}><i className="fa-solid fa-plus"></i></button>
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className="small text-muted mb-2">Theme</div>
                        <div className="d-flex gap-2">
                            <button 
                                className={`btn btn-sm flex-fill ${prefs.theme === 'light' ? 'btn-primary' : 'btn-light border'}`}
                                onClick={() => updatePref('theme', 'light')}
                            >
                                <i className="fa-solid fa-sun me-1"></i> Light
                            </button>
                            <button 
                                className={`btn btn-sm flex-fill ${prefs.theme === 'dark' ? 'btn-dark' : 'btn-light border'}`}
                                onClick={() => updatePref('theme', 'dark')}
                            >
                                <i className="fa-solid fa-moon me-1"></i> Dark
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="small text-muted mb-2">Width</div>
                        <div className="d-flex gap-2">
                            <button 
                                className={`btn btn-sm flex-fill ${prefs.width === 'comfortable' ? 'btn-primary' : 'btn-light border'}`}
                                onClick={() => updatePref('width', 'comfortable')}
                            >
                                <i className="fa-solid fa-align-center me-1"></i> Focus
                            </button>
                            <button 
                                className={`btn btn-sm flex-fill ${prefs.width === 'wide' ? 'btn-primary' : 'btn-light border'}`}
                                onClick={() => updatePref('width', 'wide')}
                            >
                                <i className="fa-solid fa-align-justify me-1"></i> Wide
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
