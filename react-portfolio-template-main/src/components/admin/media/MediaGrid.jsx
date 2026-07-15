import React from 'react'
import { supabase } from '/src/utils/supabase.js'

export default function MediaGrid({ items, onDelete, onSelect, selectedIds, setSelectedIds }) {
    if (!items || items.length === 0) {
        return (
            <div className="p-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                    <i className="pi pi-images text-muted" style={{ fontSize: '2rem' }}></i>
                </div>
                <h4 className="fw-bold mb-2">No media found</h4>
                <p className="admin-small-text mb-0" style={{ maxWidth: '400px' }}>
                    Upload an image or adjust your search filters to see results.
                </p>
            </div>
        )
    }

    const toggleSelection = (e, id) => {
        e.stopPropagation()
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem'
        }}>
            {items.map(item => {
                const { data } = supabase.storage.from('media').getPublicUrl(item.storage_path)
                const isSelected = selectedIds.includes(item.id)
                
                return (
                    <div 
                        key={item.id} 
                        className={`position-relative rounded overflow-hidden shadow-sm admin-media-card-hover ${isSelected ? 'border border-2 border-primary' : 'border border-light border-1'}`}
                        style={{ aspectRatio: '1/1', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onClick={() => onSelect && onSelect(item)}
                    >
                        <img 
                            src={data.publicUrl} 
                            alt={item.alt_text || 'Media'} 
                            className="object-fit-cover w-100 h-100" 
                            loading="lazy"
                        />
                        
                        {/* Hover Overlay */}
                        <div className="position-absolute top-0 start-0 w-100 h-100 admin-media-overlay" style={{ backgroundColor: 'rgba(0,0,0,0.1)', opacity: isSelected ? 1 : 0, transition: 'opacity 0.2s' }}>
                            <div className="position-absolute top-0 start-0 p-2">
                                <button 
                                    className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center ${isSelected ? 'btn-primary' : 'btn-light'}`}
                                    style={{ width: '28px', height: '28px', padding: 0 }}
                                    onClick={(e) => toggleSelection(e, item.id)}
                                >
                                    {isSelected && <i className="pi pi-check text-white" style={{ fontSize: '12px' }}></i>}
                                </button>
                            </div>
                        </div>

                        {/* Metadata Footer */}
                        <div className="position-absolute bottom-0 start-0 w-100 p-2 admin-media-footer" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', opacity: 0, transition: 'opacity 0.2s' }}>
                            <p className="text-truncate text-white mb-0 fw-medium admin-small-text" style={{ fontSize: '11px' }} title={item.filename}>{item.filename}</p>
                            <p className="text-white-50 mb-0 admin-small-text" style={{ fontSize: '10px' }}>
                                {(item.size_bytes / 1024).toFixed(1)} KB 
                                {item.width && item.height ? ` • ${item.width}x${item.height}` : ''}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
