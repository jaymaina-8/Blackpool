import React, { useEffect } from 'react'
import { usePublishingValidation } from '/src/hooks/usePublishingValidation.js'

export default function PublishingReadiness({ article }) {
    const { validateArticle, validationScore, validationIssues } = usePublishingValidation()

    useEffect(() => {
        validateArticle(article)
    }, [article, validateArticle])

    if (!article) return null

    return (
        <div className="admin-card border-0 shadow-sm p-4">
            <h5 className="admin-card-title mb-4">Publishing Readiness</h5>
            
            <div className="d-flex align-items-center gap-3 mb-4">
                <div className="flex-shrink-0 position-relative" style={{ width: '50px', height: '50px' }}>
                    <svg viewBox="0 0 36 36" className={`circular-chart ${validationScore === 100 ? 'text-success' : validationScore > 70 ? 'text-warning' : 'text-danger'}`} style={{ width: '100%', height: '100%' }}>
                        <path className="circle-bg"
                            d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="var(--admin-border-color)"
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
                            style={{ transition: 'stroke-dasharray 0.5s ease-out' }}
                        />
                    </svg>
                    <div className="position-absolute top-50 start-50 translate-middle admin-meta-text fw-bold text-dark">
                        {validationScore}%
                    </div>
                </div>
                <div>
                    <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '14px' }}>
                        {validationScore === 100 ? 'Ready to Publish' : validationScore > 70 ? 'Needs Improvement' : 'Not Ready'}
                    </h6>
                    <p className="admin-meta-text text-muted mb-0">
                        Score based on SEO, metadata, and standards.
                    </p>
                </div>
            </div>

            {validationIssues.length > 0 ? (
                <div className="d-flex flex-column gap-2 mt-2">
                    {validationIssues.map((issue, idx) => (
                        <div key={idx} className="d-flex gap-2 align-items-start admin-small-text p-3 rounded" style={{ backgroundColor: 'var(--admin-bg-soft)' }}>
                            <i className={`pi ${issue.type === 'error' ? 'pi-times-circle text-danger' : 'pi-exclamation-triangle text-warning'} mt-1`}></i>
                            <div>
                                <span className="fw-bold text-dark">{issue.field}:</span> <span className="text-muted">{issue.message}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="d-flex gap-2 align-items-center admin-small-text p-3 rounded bg-success bg-opacity-10 text-success mt-2">
                    <i className="pi pi-check-circle"></i>
                    <span className="fw-medium">All checklist items passed.</span>
                </div>
            )}
        </div>
    )
}
