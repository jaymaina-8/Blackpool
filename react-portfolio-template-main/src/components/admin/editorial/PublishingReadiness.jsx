import React, { useEffect } from 'react'
import { usePublishingValidation } from '/src/hooks/usePublishingValidation.js'

export default function PublishingReadiness({ article }) {
    const { validateArticle, validationScore, validationIssues } = usePublishingValidation()

    useEffect(() => {
        validateArticle(article)
    }, [article, validateArticle])

    if (!article) return null

    return (
        <div className="card shadow-sm border-0 mb-4 rounded-4">
            <div className="card-header bg-white border-bottom p-4">
                <h5 className="fw-bold m-0 tracking-tight">Publishing Readiness</h5>
            </div>
            <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                        <svg viewBox="0 0 36 36" className={`circular-chart ${validationScore === 100 ? 'text-success' : validationScore > 70 ? 'text-warning' : 'text-danger'}`}>
                            <path className="circle-bg"
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#eee"
                                strokeWidth="3"
                            />
                            <path className="circle"
                                strokeDasharray={`${validationScore}, 100`}
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            <text x="18" y="20.35" className="percentage fw-bold" textAnchor="middle" fontSize="10">{validationScore}%</text>
                        </svg>
                    </div>
                    <div>
                        <h6 className="fw-bold mb-1">
                            {validationScore === 100 ? 'Ready to Publish' : validationScore > 70 ? 'Needs Improvement' : 'Not Ready'}
                        </h6>
                        <p className="text-muted small mb-0">
                            Score based on SEO, metadata, and editorial standards.
                        </p>
                    </div>
                </div>

                {validationIssues.length > 0 && (
                    <ul className="list-group list-group-flush small">
                        {validationIssues.map((issue, idx) => (
                            <li key={idx} className="list-group-item px-0 d-flex gap-2">
                                <i className={`fa-solid ${issue.type === 'error' ? 'fa-circle-xmark text-danger' : 'fa-circle-exclamation text-warning'} mt-1`}></i>
                                <div>
                                    <strong>{issue.field}:</strong> {issue.message}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
