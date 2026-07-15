import React from 'react'
import { useLocation } from '/src/providers/LocationProvider.jsx'

export default function Breadcrumbs() {
    const { adminPath, goToAdminRoute } = useLocation()

    // Parse path into parts
    const parts = adminPath.split('/').filter(Boolean)
    
    if (parts.length === 0) return null // Don't show on dashboard

    return (
        <div className="d-flex align-items-center gap-2 mb-4 admin-small-text">
            <span 
                className="cursor-pointer" 
                style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                onClick={() => goToAdminRoute('/')}
            >
                Dashboard
            </span>
            {parts.map((part, index) => {
                const path = '/' + parts.slice(0, index + 1).join('/')
                const isLast = index === parts.length - 1
                
                // Format label: capitalize and handle IDs
                let label = part.charAt(0).toUpperCase() + part.slice(1)
                if (part.length > 20) label = 'Details' // Rough heuristic for IDs

                return (
                    <React.Fragment key={path}>
                        <i className="pi pi-chevron-right text-muted" style={{ fontSize: '0.8rem' }}></i>
                        {isLast ? (
                            <span style={{ color: 'var(--admin-text-main)', fontWeight: 500 }}>
                                {label}
                            </span>
                        ) : (
                            <span 
                                className="cursor-pointer"
                                style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                                onClick={() => goToAdminRoute(path)}
                            >
                                {label}
                            </span>
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    )
}
