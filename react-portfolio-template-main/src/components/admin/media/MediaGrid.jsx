import React from 'react'
import { supabase } from '/src/utils/supabase.js'

export default function MediaGrid({ items, onDelete, onSelect }) {
    if (!items || items.length === 0) {
        return (
            <div className="text-center p-5 bg-white rounded border">
                <p className="text-muted mb-0">No media found. Upload an image to get started.</p>
            </div>
        )
    }

    return (
        <div className="row g-4">
            {items.map(item => {
                const { data } = supabase.storage.from('media').getPublicUrl(item.storage_path)
                return (
                    <div key={item.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <div className="card h-100 border-0 shadow-sm overflow-hidden admin-media-card" onClick={() => onSelect && onSelect(item)} style={{ cursor: 'pointer' }}>
                            <div className="ratio ratio-1x1 bg-light position-relative">
                                <img 
                                    src={data.publicUrl} 
                                    alt={item.alt_text || 'Media'} 
                                    className="object-fit-cover w-100 h-100" 
                                    loading="lazy"
                                />
                                <div className="position-absolute top-0 end-0 p-2 admin-media-actions">
                                    <button 
                                        className="btn btn-sm btn-danger shadow"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if(window.confirm('Are you sure you want to delete this media?')) {
                                                onDelete(item)
                                            }
                                        }}
                                        title="Delete Media"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="card-body p-2 bg-white">
                                <p className="text-truncate mb-0 fw-medium small" title={item.filename}>{item.filename}</p>
                                <small className="text-muted">
                                    {(item.size_bytes / 1024).toFixed(1)} KB 
                                    {item.width && item.height ? ` • ${item.width}x${item.height}` : ''}
                                </small>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
