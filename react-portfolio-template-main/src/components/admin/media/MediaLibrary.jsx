import React, { useEffect, useState } from 'react'
import { useMedia } from '/src/hooks/useMedia.js'
import MediaUploader from './MediaUploader.jsx'
import MediaGrid from './MediaGrid.jsx'
import MediaModal from './MediaModal.jsx'

export default function MediaLibrary() {
    const { fetchMedia, uploadMedia, deleteMedia, updateMediaMetadata, isUploading, uploadProgress, error } = useMedia()
    const [mediaItems, setMediaItems] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState(null)
    const [selectedIds, setSelectedIds] = useState([])
    
    // Filters and sorting
    const [searchQuery, setSearchQuery] = useState('')
    const [mimeFilter, setMimeFilter] = useState('') // 'image/' etc
    const [sortOrder, setSortOrder] = useState('desc')

    const loadMedia = async () => {
        setIsLoading(true)
        try {
            const items = await fetchMedia({
                search: searchQuery,
                mimeType: mimeFilter,
                sortOrder: sortOrder
            })
            setMediaItems(items || [])
        } catch (err) {
            console.error("Failed to load media:", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            loadMedia()
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery, mimeFilter, sortOrder])

    const handleUpload = async (file) => {
        try {
            await uploadMedia(file)
            loadMedia() // Refresh the list on success
        } catch (err) {
            // Error is caught and surfaced by the hook to the uploader component
        }
    }

    const handleDelete = async (item) => {
        try {
            await deleteMedia(item)
            setSelectedItem(null)
            setSelectedIds(prev => prev.filter(id => id !== item.id))
            loadMedia()
        } catch (err) {
            alert('Failed to delete media: ' + err.message)
        }
    }

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return
        
        try {
            for (const id of selectedIds) {
                const item = mediaItems.find(m => m.id === id)
                if (item) await deleteMedia(item)
            }
            setSelectedIds([])
            loadMedia()
        } catch (err) {
            alert('Failed to delete some media items: ' + err.message)
        }
    }

    const handleUpdateMetadata = async (id, updates) => {
        await updateMediaMetadata(id, updates)
        setSelectedItem(prev => ({...prev, ...updates}))
        loadMedia()
    }

    return (
        <div className="d-flex flex-column h-100" style={{ gap: 'var(--admin-gap-md)' }}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-2" style={{ gap: 'var(--admin-gap-component)' }}>
                <div>
                    <h1 className="admin-page-title mb-2">Media Library</h1>
                    <p className="admin-body-text mb-0">Upload and manage images for your articles.</p>
                </div>
            </div>

            <MediaUploader 
                onUpload={handleUpload}
                isUploading={isUploading}
                progress={uploadProgress}
                error={error}
            />
            
            <div className="admin-card p-0 d-flex flex-column flex-grow-1 overflow-hidden" style={{ minHeight: 0 }}>
                {/* Toolbar */}
                <div className="p-3 border-bottom border-light d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 bg-white" style={{ position: 'sticky', top: 0, zIndex: 20 }}>
                    <div className="d-flex flex-wrap gap-2 align-items-center flex-grow-1">
                        <div className="position-relative" style={{ minWidth: '280px' }}>
                            <i className="pi pi-search position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}></i>
                            <input 
                                type="text" 
                                className="form-control form-control-sm bg-light border-0 ps-5" 
                                placeholder="Search by filename..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ borderRadius: '6px', fontSize: '13px' }}
                            />
                        </div>
                        <select className="form-select form-select-sm bg-light border-0 w-auto" value={mimeFilter} onChange={(e) => setMimeFilter(e.target.value)} style={{ borderRadius: '6px', fontSize: '13px' }}>
                            <option value="">Type: All</option>
                            <option value="image/jpeg">JPEG</option>
                            <option value="image/png">PNG</option>
                            <option value="image/webp">WEBP</option>
                            <option value="image/gif">GIF</option>
                            <option value="image/svg+xml">SVG</option>
                        </select>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <select className="form-select form-select-sm bg-light border-0 w-auto" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ borderRadius: '6px', fontSize: '13px' }}>
                            <option value="desc">Sort: Newest First</option>
                            <option value="asc">Sort: Oldest First</option>
                        </select>
                    </div>
                </div>

                {/* Bulk Actions Slide Down */}
                {selectedIds.length > 0 && (
                    <div className="bg-primary bg-opacity-10 border-bottom border-primary px-3 py-2 d-flex flex-row align-items-center justify-content-between" style={{ animation: 'slideDown 0.2s ease-out' }}>
                        <span className="fw-bold text-primary" style={{ fontSize: '13px' }}>{selectedIds.length} items selected</span>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-white border shadow-sm fw-medium" onClick={() => setSelectedIds([])} style={{ fontSize: '12px' }}>Deselect All</button>
                            <button className="btn btn-sm btn-danger shadow-sm fw-medium" onClick={handleBulkDelete} style={{ fontSize: '12px' }}>Delete Selected</button>
                        </div>
                    </div>
                )}
                
                <div className="flex-grow-1 overflow-auto position-relative p-4">

            {isLoading ? (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="admin-small-text text-muted mt-2">Loading library...</p>
                </div>
            ) : (
                <MediaGrid 
                    items={mediaItems} 
                    onDelete={handleDelete}
                    onSelect={setSelectedItem}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                />
                )}
            </div>
        </div>

        {selectedItem && (
                <MediaModal 
                    item={selectedItem} 
                    onClose={() => setSelectedItem(null)} 
                    onDelete={handleDelete}
                    onUpdate={handleUpdateMetadata}
                />
            )}
            <style jsx>{`
                @keyframes slideDown {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    )
}
