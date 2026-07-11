import React, { useRef } from 'react'

export default function MediaUploader({ onUpload, isUploading, progress, error }) {
    const fileInputRef = useRef(null)

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            onUpload(file)
            e.target.value = null
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) {
            onUpload(file)
        }
    }

    return (
        <div 
            className={`media-uploader border border-2 border-dashed rounded p-5 text-center bg-white mb-4 ${isUploading ? 'opacity-75' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{ cursor: isUploading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', borderColor: 'var(--bs-border-color)' }}
            onClick={() => !isUploading && fileInputRef.current.click()}
        >
            <input 
                type="file" 
                className="d-none" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/jpeg, image/png, image/webp, image/gif, image/svg+xml"
                disabled={isUploading}
            />
            {isUploading ? (
                <div>
                    <div className="spinner-border text-primary mb-3" role="status" />
                    <h5 className="text-primary mb-2">Uploading...</h5>
                    <div className="progress mx-auto" style={{ height: '8px', maxWidth: '300px' }}>
                        <div className="progress-bar bg-primary transition-all" style={{ width: `${progress}%`, transition: 'width 0.3s' }} />
                    </div>
                </div>
            ) : (
                <div>
                    <i className="fa-solid fa-cloud-arrow-up fs-1 text-primary mb-3"></i>
                    <h5 className="fw-bold mb-1">Click or drag & drop to upload</h5>
                    <p className="text-muted mb-0">SVG, PNG, JPG or GIF (max. 5MB)</p>
                </div>
            )}
            {error && <div className="alert alert-danger mt-3 mb-0" onClick={(e) => e.stopPropagation()}>{error}</div>}
        </div>
    )
}
