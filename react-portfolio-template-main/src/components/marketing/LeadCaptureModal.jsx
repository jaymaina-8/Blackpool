import React, { useState } from 'react'
import { useLeadMagnets } from '/src/hooks/useLeadMagnets.js'

export default function LeadCaptureModal({ magnet, onClose }) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('idle') // 'idle', 'loading', 'success', 'error'
    const { captureLeadAndDownload } = useLeadMagnets()

    if (!magnet) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (magnet.email_required && (!email || !email.includes('@'))) return
        
        setStatus('loading')
        
        const result = await captureLeadAndDownload(magnet, {
            name,
            email,
            source: window.location.pathname
        })

        if (result.success) {
            setStatus('success')
            setTimeout(() => {
                onClose()
            }, 3000)
        } else {
            setStatus('error')
        }
    }

    return (
        <>
            <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
            <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }} onClick={onClose}>
                <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                        
                        {/* Header/Banner */}
                        <div className="bg-primary text-white p-4 text-center position-relative">
                            <button 
                                type="button" 
                                className="btn-close btn-close-white position-absolute top-0 end-0 m-3" 
                                aria-label="Close"
                                onClick={onClose}
                            ></button>
                            <i className="fa-solid fa-cloud-arrow-down fs-1 mb-3"></i>
                            <h4 className="fw-bold m-0">{magnet.title}</h4>
                        </div>
                        
                        {/* Body */}
                        <div className="modal-body p-4 p-md-5">
                            {status === 'success' ? (
                                <div className="text-center py-4">
                                    <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '64px', height: '64px'}}>
                                        <i className="fa-solid fa-check fs-2"></i>
                                    </div>
                                    <h4 className="fw-bold mb-2">Success!</h4>
                                    <p className="text-muted">{magnet.thank_you_message}</p>
                                    <p className="small text-muted mb-0">Your download should begin automatically.</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-center text-muted mb-4">{magnet.description}</p>
                                    
                                    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                                        {magnet.email_required ? (
                                            <>
                                                <div>
                                                    <label htmlFor="leadName" className="form-label small fw-bold text-muted">First Name (Optional)</label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control form-control-lg bg-light border-0" 
                                                        id="leadName" 
                                                        placeholder="Jane"
                                                        value={name}
                                                        onChange={e => setName(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="leadEmail" className="form-label small fw-bold text-muted">Email Address <span className="text-danger">*</span></label>
                                                    <input 
                                                        type="email" 
                                                        className="form-control form-control-lg bg-light border-0" 
                                                        id="leadEmail" 
                                                        placeholder="jane@example.com"
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <button 
                                                    type="submit" 
                                                    className="btn btn-primary btn-lg rounded-pill fw-medium mt-3"
                                                    disabled={status === 'loading'}
                                                >
                                                    {status === 'loading' ? <span className="spinner-border spinner-border-sm"></span> : 'Get Your Free Guide'}
                                                </button>
                                            </>
                                        ) : (
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary btn-lg rounded-pill fw-medium"
                                                disabled={status === 'loading'}
                                            >
                                                {status === 'loading' ? <span className="spinner-border spinner-border-sm"></span> : 'Download Now'}
                                            </button>
                                        )}
                                        
                                        {status === 'error' && (
                                            <div className="text-danger small text-center fw-medium mt-2">
                                                <i className="fa-solid fa-circle-exclamation me-1"></i> Something went wrong. Please try again.
                                            </div>
                                        )}
                                        
                                        {magnet.email_required && (
                                            <div className="text-center mt-3">
                                                <small className="text-muted" style={{fontSize: '0.75rem'}}>
                                                    By downloading, you agree to receive our latest insights and updates. You can unsubscribe at any time.
                                                </small>
                                            </div>
                                        )}
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
