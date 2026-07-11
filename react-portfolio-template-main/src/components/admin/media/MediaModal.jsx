import React, { useState, useEffect } from 'react'
import { supabase } from '/src/utils/supabase.js'

export default function MediaModal({ item, onClose, onDelete, onUpdate }) {
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        alt_text: '',
        caption: '',
        description: ''
    })

    useEffect(() => {
        if (item) {
            setFormData({
                alt_text: item.alt_text || '',
                caption: item.caption || '',
                description: item.description || ''
            })
        }
    }, [item])

    if (!item) return null

    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(item.storage_path)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await onUpdate(item.id, formData)
            onClose()
        } catch (err) {
            alert('Failed to update metadata.')
        } finally {
            setIsSaving(false)
        }
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString()
    }

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold">Attachment Details</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="row g-4">
                            {/* Image Preview */}
                            <div className="col-md-7 text-center bg-light rounded d-flex align-items-center justify-content-center p-3" style={{ minHeight: '400px' }}>
                                <img 
                                    src={publicUrlData.publicUrl} 
                                    alt={item.alt_text} 
                                    className="img-fluid rounded" 
                                    style={{ maxHeight: '600px', objectFit: 'contain' }}
                                />
                            </div>
                            
                            {/* Metadata and Edit Form */}
                            <div className="col-md-5">
                                <div className="mb-4">
                                    <h6 className="fw-bold mb-1 text-truncate" title={item.filename}>{item.filename}</h6>
                                    <div className="text-muted small mb-2 d-flex flex-column gap-1">
                                        <span><strong>Uploaded:</strong> {formatDate(item.created_at)}</span>
                                        <span><strong>File Size:</strong> {(item.size_bytes / 1024).toFixed(1)} KB</span>
                                        <span><strong>Dimensions:</strong> {item.width && item.height ? `${item.width} by ${item.height} pixels` : 'N/A'}</span>
                                        <span><strong>File Type:</strong> {item.mime_type}</span>
                                        <span><strong>Canonical Path:</strong> {item.storage_path}</span>
                                    </div>
                                    <button 
                                        className="btn btn-sm btn-outline-danger w-100 mt-2"
                                        onClick={() => {
                                            if(window.confirm('Are you sure you want to delete this media?')) {
                                                onDelete(item)
                                            }
                                        }}
                                    >
                                        Delete Media
                                    </button>
                                </div>

                                <hr />

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-medium small">Alt Text</label>
                                        <input 
                                            type="text" 
                                            className="form-control form-control-sm" 
                                            value={formData.alt_text}
                                            onChange={(e) => setFormData({...formData, alt_text: e.target.value})}
                                            placeholder="Describe the image for screen readers"
                                        />
                                        <div className="form-text" style={{fontSize: '11px'}}>Critical for SEO and accessibility.</div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-medium small">Caption</label>
                                        <input 
                                            type="text" 
                                            className="form-control form-control-sm" 
                                            value={formData.caption}
                                            onChange={(e) => setFormData({...formData, caption: e.target.value})}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-medium small">Description</label>
                                        <textarea 
                                            className="form-control form-control-sm" 
                                            rows="3"
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100" disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
