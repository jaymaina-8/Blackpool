import React, { useState } from 'react'
import LeadCaptureModal from './LeadCaptureModal.jsx'
import { track, EVENTS } from '/src/utils/analytics/index.js'

export default function LeadMagnetCard({ magnet }) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    if (!magnet) return null

    const handleOpen = () => {
        track(EVENTS.LEAD_MAGNET_VIEWED, { magnet_id: magnet.id, magnet_title: magnet.title })
        setIsModalOpen(true)
    }

    return (
        <>
            <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden blog-card transition-all">
                <div className="bg-light d-flex align-items-center justify-content-center position-relative" style={{ height: '180px', overflow: 'hidden' }}>
                    {magnet.image_url ? (
                        <img src={magnet.image_url} alt={magnet.title} className="w-100 h-100 object-fit-cover" />
                    ) : (
                        <div className="text-primary opacity-25">
                            <i className="fa-solid fa-file-pdf" style={{ fontSize: '5rem' }}></i>
                        </div>
                    )}
                    <span className="position-absolute top-0 end-0 m-3 badge bg-white text-dark shadow-sm px-3 py-2 rounded-pill fw-bold">
                        Free Download
                    </span>
                </div>
                <div className="card-body p-4 d-flex flex-column">
                    {magnet.category && (
                        <div className="text-uppercase text-primary small fw-bold tracking-wider mb-2">
                            {magnet.category}
                        </div>
                    )}
                    <h5 className="card-title fw-bold mb-3">{magnet.title}</h5>
                    <p className="card-text text-muted mb-4 small" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {magnet.description}
                    </p>
                    <button 
                        className="btn btn-primary mt-auto rounded-pill fw-medium py-2"
                        onClick={handleOpen}
                    >
                        <i className="fa-solid fa-download me-2"></i> Download Now
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <LeadCaptureModal 
                    magnet={magnet} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </>
    )
}
