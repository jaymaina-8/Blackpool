import React, { useState } from 'react'
import { supabase } from '/src/utils/supabase.js'
import { newsletterConfig } from '/src/config/newsletterConfig.js'
import { track, EVENTS } from '/src/utils/analytics/index.js'

export default function NewsletterSignup({ source = 'blog' }) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('idle') // 'idle', 'loading', 'success', 'error', 'duplicate'
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email || !email.includes('@')) return
        
        setStatus('loading')
        
        try {
            const { error } = await supabase
                .from('newsletter_subscribers')
                .insert([{ name, email }])
                
            if (error) {
                if (error.code === '23505') { // Unique violation
                    setStatus('duplicate')
                } else {
                    throw error
                }
            } else {
                setStatus('success')
                setName('')
                setEmail('')
                if (source === 'homepage') {
                    track(EVENTS.HOMEPAGE_NEWSLETTER_SUBMITTED)
                } else {
                    track(EVENTS.NEWSLETTER_SUBMITTED)
                }
            }
        } catch (err) {
            console.error("Newsletter subscription error:", err)
            setStatus('error')
        }
    }

    return (
        <div className="bg-dark text-white rounded-4 p-5 mb-5 shadow text-center">
            <div className="mx-auto" style={{ maxWidth: '600px' }}>
                <i className="fa-regular fa-envelope-open fs-1 text-primary mb-3"></i>
                <h3 className="fw-bold mb-3 tracking-tight">{newsletterConfig.headline}</h3>
                <p className="text-white-50 mb-4">{newsletterConfig.description}</p>
                
                {status === 'success' ? (
                    <div className="alert alert-success border-0 bg-success bg-opacity-25 text-white fw-medium rounded-3 py-3" role="alert">
                        <i className="fa-solid fa-circle-check me-2"></i>
                        {newsletterConfig.successMessage}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                        <div className="row g-3">
                            <div className="col-12 col-md-5">
                                <label htmlFor="newsletterName" className="visually-hidden">Name</label>
                                <input 
                                    type="text" 
                                    id="newsletterName"
                                    className="form-control form-control-lg bg-white bg-opacity-10 border-0 text-white rounded-pill px-4" 
                                    placeholder={newsletterConfig.placeholderName}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="col-12 col-md-7">
                                <label htmlFor="newsletterEmail" className="visually-hidden">Email</label>
                                <div className="input-group">
                                    <input 
                                        type="email" 
                                        id="newsletterEmail"
                                        className="form-control form-control-lg bg-white bg-opacity-10 border-0 text-white rounded-start-pill px-4" 
                                        placeholder={newsletterConfig.placeholderEmail}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <button 
                                        className="btn btn-primary px-4 rounded-end-pill fw-medium" 
                                        type="submit"
                                        disabled={status === 'loading'}
                                        aria-label={newsletterConfig.buttonText}
                                    >
                                        {status === 'loading' ? <span className="spinner-border spinner-border-sm" aria-hidden="true"></span> : newsletterConfig.buttonText}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {status === 'error' && (
                            <div className="text-danger small fw-medium mt-2" role="alert">
                                <i className="fa-solid fa-triangle-exclamation me-1"></i>
                                {newsletterConfig.errorMessage}
                            </div>
                        )}
                        {status === 'duplicate' && (
                            <div className="text-warning small fw-medium mt-2" role="alert">
                                <i className="fa-solid fa-circle-info me-1"></i>
                                {newsletterConfig.duplicateMessage}
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    )
}
