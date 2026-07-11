import React, { useState } from 'react'
import { useEditorialWorkflow } from '/src/hooks/useEditorialWorkflow.js'

export default function PublishingPanel({ article, onStatusChange }) {
    const { updateStatus, loading } = useEditorialWorkflow()
    const [scheduleDate, setScheduleDate] = useState(
        article.published_at ? new Date(article.published_at).toISOString().slice(0, 16) : ''
    )

    const handleAction = async (newStatus) => {
        let payload = { status: newStatus }
        if (newStatus === 'scheduled') {
            if (!scheduleDate) return alert('Please select a date/time to schedule.')
            payload.published_at = new Date(scheduleDate).toISOString()
        } else if (newStatus === 'published') {
            payload.published_at = new Date().toISOString()
        }

        const success = await updateStatus(article.id, newStatus, payload)
        if (success) onStatusChange(newStatus)
    }

    if (!article) return null

    return (
        <div className="card shadow-sm border-0 mb-4 rounded-4">
            <div className="card-header bg-white border-bottom p-4">
                <h5 className="fw-bold m-0 tracking-tight">Publishing Panel</h5>
            </div>
            <div className="card-body p-4">
                <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small fw-medium">Current Status:</span>
                        <span className={`badge ${article.status === 'published' ? 'bg-success' : article.status === 'scheduled' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                            {article.status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                </div>

                <hr className="my-3" />

                <div className="d-flex flex-column gap-2">
                    {/* Draft Action */}
                    {article.status !== 'draft' && article.status !== 'archived' && (
                        <button 
                            className="btn btn-outline-secondary w-100" 
                            onClick={() => handleAction('draft')} 
                            disabled={loading}
                        >
                            Revert to Draft
                        </button>
                    )}

                    {/* Schedule Action */}
                    {article.status !== 'published' && article.status !== 'archived' && (
                        <div className="border rounded p-3 bg-light mt-2">
                            <label className="form-label small fw-medium text-muted">Schedule Publishing</label>
                            <input 
                                type="datetime-local" 
                                className="form-control form-control-sm mb-2" 
                                value={scheduleDate} 
                                onChange={(e) => setScheduleDate(e.target.value)} 
                            />
                            <button 
                                className="btn btn-primary btn-sm w-100" 
                                onClick={() => handleAction('scheduled')} 
                                disabled={loading}
                            >
                                Schedule
                            </button>
                        </div>
                    )}

                    {/* Publish Action */}
                    {article.status !== 'published' && article.status !== 'archived' && (
                        <button 
                            className="btn btn-success w-100 mt-2" 
                            onClick={() => handleAction('published')} 
                            disabled={loading}
                        >
                            <i className="fa-solid fa-paper-plane me-2"></i>
                            Publish Now
                        </button>
                    )}

                    {/* Archive Action */}
                    {article.status === 'published' && (
                        <button 
                            className="btn btn-outline-danger w-100" 
                            onClick={() => {
                                if (window.confirm("Archive this article?\n\nThe article will disappear from the public website but remain recoverable.")) {
                                    handleAction('archived')
                                }
                            }} 
                            disabled={loading}
                        >
                            <i className="fa-solid fa-box-archive me-2"></i>
                            Archive Post
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
