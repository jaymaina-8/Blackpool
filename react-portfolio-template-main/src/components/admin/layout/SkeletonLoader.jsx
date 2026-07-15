import React from 'react'

export default function SkeletonLoader({ type = 'card', count = 1, className = '' }) {
    const skeletons = []

    for (let i = 0; i < count; i++) {
        if (type === 'card') {
            skeletons.push(
                <div key={i} className={`admin-card border-0 shadow-sm p-4 ${className}`}>
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="admin-skeleton rounded-circle" style={{ width: '50px', height: '50px' }}></div>
                        <div className="flex-grow-1">
                            <div className="admin-skeleton col-6 mb-2 rounded" style={{ height: '20px' }}></div>
                            <div className="admin-skeleton col-4 mb-0 rounded" style={{ height: '14px' }}></div>
                        </div>
                    </div>
                    <div className="admin-skeleton col-12 rounded mb-2" style={{ height: '16px' }}></div>
                    <div className="admin-skeleton col-8 rounded" style={{ height: '16px' }}></div>
                </div>
            )
        } else if (type === 'table') {
            skeletons.push(
                <div key={i} className={`d-flex align-items-center gap-3 py-3 border-bottom border-light ${className}`}>
                    <div className="admin-skeleton col-2 rounded" style={{ height: '16px' }}></div>
                    <div className="admin-skeleton col-3 rounded" style={{ height: '16px' }}></div>
                    <div className="admin-skeleton col-2 rounded" style={{ height: '16px' }}></div>
                    <div className="admin-skeleton col-2 ms-auto rounded" style={{ height: '16px' }}></div>
                </div>
            )
        } else if (type === 'stat') {
            skeletons.push(
                <div key={i} className={`admin-card ${className}`}>
                    <div className="admin-skeleton col-4 mb-3 rounded" style={{ height: '16px' }}></div>
                    <div className="admin-skeleton col-8 rounded" style={{ height: '36px' }}></div>
                </div>
            )
        } else {
            skeletons.push(<div key={i} className={`admin-skeleton col-12 rounded ${className}`} style={{ height: '20px' }}></div>)
        }
    }

    return <>{skeletons}</>
}
