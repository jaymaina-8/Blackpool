import React from 'react'

export default function EmptyState({ 
    icon = 'pi-inbox', 
    title = 'No Data Found', 
    description = 'There is currently no data available to display in this section.',
    primaryAction = null,
    secondaryAction = null
}) {
    return (
        <div className="admin-empty-state animation-fade-in">
            <i className={`pi ${icon} admin-empty-icon`}></i>
            <h4 className="fw-bold mb-2 text-dark">{title}</h4>
            <p className="admin-body-text max-w-md mx-auto mb-4">{description}</p>
            
            {(primaryAction || secondaryAction) && (
                <div className="d-flex gap-3 mt-2">
                    {secondaryAction && (
                        <button className="admin-btn admin-btn-outline" onClick={secondaryAction.onClick}>
                            {secondaryAction.icon && <i className={`pi ${secondaryAction.icon}`}></i>}
                            {secondaryAction.label}
                        </button>
                    )}
                    {primaryAction && (
                        <button className="admin-btn admin-btn-primary" onClick={primaryAction.onClick}>
                            {primaryAction.icon && <i className={`pi ${primaryAction.icon}`}></i>}
                            {primaryAction.label}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
