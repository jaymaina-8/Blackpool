import React from 'react'

export default function PublishingChecklist({ rules }) {
    return (
        <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white fw-bold py-3">Publishing Checklist</div>
            <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                    {rules.map((rule, idx) => (
                        <li key={idx} className="list-group-item d-flex align-items-start py-3 border-0 border-bottom bg-transparent">
                            <div className="me-3 mt-1">
                                {rule.isPassed ? (
                                    <i className="fa-solid fa-circle-check text-success fs-5"></i>
                                ) : (
                                    <i className="fa-regular fa-circle text-muted fs-5 opacity-50"></i>
                                )}
                            </div>
                            <div>
                                <div className={`fw-medium ${rule.isPassed ? 'text-success' : 'text-dark'}`}>
                                    {rule.name}
                                </div>
                                <div className="small text-muted lh-sm mt-1" style={{ fontSize: '0.8rem' }}>
                                    {rule.description}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
