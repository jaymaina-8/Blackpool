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
            loadMedia()
        } catch (err) {
            alert('Failed to delete media: ' + err.message)
        }
    }

    const handleUpdateMetadata = async (id, updates) => {
        await updateMediaMetadata(id, updates)
        setSelectedItem(prev => ({...prev, ...updates}))
        loadMedia()
    }

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h3 className="fw-bold m-0">Media Library</h3>
                    <p className="text-muted mb-0">Upload and manage images for your articles.</p>
                </div>
            </div>

            <MediaUploader 
                onUpload={handleUpload}
                isUploading={isUploading}
                progress={uploadProgress}
                error={error}
            />
            
            {/* Toolbar */}
            <div className="bg-white p-3 rounded border mb-4 d-flex gap-3 align-items-center flex-wrap shadow-sm">
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search by filename..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ maxWidth: '300px' }}
                />
                <select className="form-select w-auto" value={mimeFilter} onChange={(e) => setMimeFilter(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WEBP</option>
                    <option value="image/gif">GIF</option>
                    <option value="image/svg+xml">SVG</option>
                </select>
                <select className="form-select w-auto ms-auto" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                </select>
            </div>

            {isLoading ? (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="text-muted mt-2">Loading library...</p>
                </div>
            ) : (
                <MediaGrid 
                    items={mediaItems} 
                    onDelete={handleDelete}
                    onSelect={setSelectedItem}
                />
            )}

            {selectedItem && (
                <MediaModal 
                    item={selectedItem} 
                    onClose={() => setSelectedItem(null)} 
                    onDelete={handleDelete}
                    onUpdate={handleUpdateMetadata}
                />
            )}
        </div>
    )
}
