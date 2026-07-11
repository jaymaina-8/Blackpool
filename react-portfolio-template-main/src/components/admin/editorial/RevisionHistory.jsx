import React, { useEffect, useState } from 'react'
import { useArticleVersions } from '/src/hooks/useArticleVersions.js'
import RevisionDiff from './RevisionDiff.jsx'

export default function RevisionHistory({ articleId, onRestore }) {
    const { fetchVersions, loading } = useArticleVersions()
    const [versions, setVersions] = useState([])
    const [comparingId, setComparingId] = useState(null)

    useEffect(() => {
        if (articleId) {
            fetchVersions(articleId).then(setVersions)
        }
    }, [articleId, fetchVersions])

    if (!versions.length) return null

    return (
        <div className="card shadow-sm border-0 mb-4 rounded-4">
            <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold m-0 tracking-tight">Revision History</h5>
                <span className="badge bg-light text-dark border">{versions.length} versions</span>
            </div>
            <div className="list-group list-group-flush">
                {versions.map((ver, idx) => (
                    <div key={ver.id} className="list-group-item p-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <strong className="me-2">v{ver.version}</strong>
                                <span className="small text-muted">{new Date(ver.created_at).toLocaleString()}</span>
                            </div>
                            {idx > 0 && (
                                <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => onRestore && onRestore(ver)}
                                >
                                    Restore
                                </button>
                            )}
                        </div>
                        <div className="small text-muted mb-2">
                            By {ver.created_by?.full_name || 'Unknown User'}
                        </div>
                        <div className="small bg-light p-2 rounded mb-3">
                            {ver.change_summary}
                        </div>
                        
                        {idx < versions.length - 1 && (
                            <button 
                                className="btn btn-sm btn-link p-0 text-decoration-none small"
                                onClick={() => setComparingId(comparingId === ver.id ? null : ver.id)}
                            >
                                {comparingId === ver.id ? 'Hide Changes' : 'Show Changes'}
                            </button>
                        )}
                        
                        {comparingId === ver.id && idx < versions.length - 1 && (
                            <div className="mt-3">
                                <RevisionDiff 
                                    oldText={versions[idx + 1].html_content?.replace(/<[^>]+>/g, '') || ''}
                                    newText={ver.html_content?.replace(/<[^>]+>/g, '') || ''}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
