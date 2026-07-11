import React from 'react'

export default function AuthorBadge({ badge }) {
    if (!badge) return null
    
    return (
        <span 
            className={`badge bg-${badge.color || 'primary'} bg-opacity-10 text-${badge.color || 'primary'} border border-${badge.color || 'primary'} border-opacity-25 rounded-pill px-3 py-2 fw-medium d-inline-flex align-items-center gap-2`}
            title={badge.description || badge.name}
        >
            {badge.icon && <i className={`fa-solid ${badge.icon}`}></i>}
            {badge.name}
        </span>
    )
}
