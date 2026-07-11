import React, { useEffect, useState } from 'react'
import { useEditorialWorkflow } from '/src/hooks/useEditorialWorkflow.js'

export default function WorkflowTimeline({ articleId, currentStatus }) {
    const { fetchHistory } = useEditorialWorkflow()
    const [history, setHistory] = useState([])

    useEffect(() => {
        if (articleId) {
            fetchHistory(articleId).then(setHistory)
        }
    }, [articleId, currentStatus, fetchHistory])

    if (!history.length) return null

    return (
        <div className="card shadow-sm border-0 mb-4 rounded-4">
            <div className="card-header bg-white border-bottom p-4">
                <h5 className="fw-bold m-0 tracking-tight">Workflow Timeline</h5>
            </div>
            <div className="card-body p-4">
                <div className="position-relative">
                    <div className="position-absolute h-100 bg-light" style={{ width: '2px', left: '16px', top: '0' }}></div>
                    {history.map((event, idx) => (
                        <div key={event.id} className="d-flex mb-4 position-relative">
                            <div className="bg-primary rounded-circle border border-white border-3 z-1 flex-shrink-0" style={{ width: '12px', height: '12px', marginLeft: '11px', marginTop: '6px' }}></div>
                            <div className="ms-3">
                                <div className="small text-muted mb-1">
                                    {new Date(event.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                </div>
                                <div>
                                    <strong>{event.changed_by?.full_name || 'System'}</strong> changed status to <span className="badge bg-light text-dark border">{event.new_status}</span>
                                </div>
                                {event.comment && (
                                    <div className="mt-2 small bg-light p-2 rounded text-muted">
                                        "{event.comment}"
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
