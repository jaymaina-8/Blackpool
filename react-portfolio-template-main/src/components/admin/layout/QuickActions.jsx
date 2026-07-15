import React, { useState } from 'react'
import { useLocation } from '/src/providers/LocationProvider.jsx'

export default function QuickActions() {
    const { goToAdminRoute } = useLocation()
    const [isOpen, setIsOpen] = useState(false)

    const actions = [
        { label: 'New Article', path: '/articles/new', icon: 'pi-file-edit' },
        { label: 'Upload Media', path: '/media', icon: 'pi-cloud-upload' },
        { label: 'New Category', path: '/categories', icon: 'pi-tags' },
        { label: 'Create Campaign', path: '/marketing/campaigns', icon: 'pi-megaphone' },
    ]

    return (
        <div className="position-fixed" style={{ bottom: '2rem', right: '2rem', zIndex: 1040 }}>
            {isOpen && (
                <div className="d-flex flex-column gap-2 mb-3 align-items-end">
                    {actions.map((action, idx) => (
                        <button 
                            key={idx}
                            className="admin-btn admin-btn-outline admin-card p-2 px-3 shadow-sm d-flex align-items-center gap-2"
                            onClick={() => {
                                goToAdminRoute(action.path)
                                setIsOpen(false)
                            }}
                            style={{ borderRadius: '20px', whiteSpace: 'nowrap' }}
                        >
                            <span>{action.label}</span>
                            <i className={`pi ${action.icon} text-primary`}></i>
                        </button>
                    ))}
                </div>
            )}
            <button 
                className="admin-btn admin-btn-primary shadow rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '56px', height: '56px', fontSize: '24px' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <i className={`pi ${isOpen ? 'pi-times' : 'pi-plus'}`}></i>
            </button>
        </div>
    )
}
