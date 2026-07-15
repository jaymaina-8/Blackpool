import React, { useState } from 'react'

export default function SettingsLayout() {
    const [activeTab, setActiveTab] = useState('general')

    const tabs = [
        { id: 'general', label: 'General', icon: 'pi-cog' },
        { id: 'seo', label: 'SEO', icon: 'pi-search' },
        { id: 'email', label: 'Email', icon: 'pi-envelope' },
        { id: 'integrations', label: 'Integrations', icon: 'pi-link' },
        { id: 'danger', label: 'Danger Zone', icon: 'pi-exclamation-triangle' },
    ]

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="animation-fade-in">
                        <div className="admin-card mb-4 border-0 shadow-sm p-5">
                            <h5 className="admin-card-title mb-4">Site Information</h5>
                            <form className="d-flex flex-column gap-4 max-w-lg">
                                <div>
                                    <label className="form-label admin-meta-text fw-bold text-uppercase tracking-wider">Site Name</label>
                                    <input type="text" className="form-control admin-form-control bg-light" defaultValue="Project Atlas" />
                                </div>
                                <div>
                                    <label className="form-label admin-meta-text fw-bold text-uppercase tracking-wider">Site Tagline</label>
                                    <input type="text" className="form-control admin-form-control bg-light" defaultValue="The ultimate CMS" />
                                </div>
                                <div>
                                    <label className="form-label admin-meta-text fw-bold text-uppercase tracking-wider">Admin Email</label>
                                    <input type="email" className="form-control admin-form-control bg-light" defaultValue="admin@example.com" />
                                </div>
                                <div className="mt-2">
                                    <button className="admin-btn admin-btn-primary shadow-sm">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            case 'seo':
                return (
                    <div className="animation-fade-in">
                        <div className="admin-card mb-4 border-0 shadow-sm p-5">
                            <h5 className="admin-card-title mb-4">Global SEO</h5>
                            <form className="d-flex flex-column gap-4 max-w-lg">
                                <div>
                                    <label className="form-label admin-meta-text fw-bold text-uppercase tracking-wider">Default Meta Title</label>
                                    <input type="text" className="form-control admin-form-control bg-light" defaultValue="Project Atlas - Modern CMS" />
                                </div>
                                <div>
                                    <label className="form-label admin-meta-text fw-bold text-uppercase tracking-wider">Default Meta Description</label>
                                    <textarea className="form-control admin-form-control bg-light" rows="3" defaultValue="A powerful, headless content management system built for speed and flexibility."></textarea>
                                </div>
                                <div>
                                    <label className="form-label admin-meta-text fw-bold text-uppercase tracking-wider">Robots.txt Content</label>
                                    <textarea className="form-control admin-form-control bg-light font-monospace text-muted" rows="4" defaultValue="User-agent: *&#10;Allow: /"></textarea>
                                </div>
                                <div className="mt-2">
                                    <button className="admin-btn admin-btn-primary shadow-sm">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            case 'email':
                return (
                    <div className="animation-fade-in text-center p-5 admin-card border-0 shadow-sm d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                        <i className="pi pi-envelope text-muted mb-4" style={{ fontSize: '3.5rem', opacity: 0.3 }}></i>
                        <h4 className="fw-bold mb-3">Email Configuration</h4>
                        <p className="admin-body-text text-muted max-w-md mx-auto mb-4">
                            Configure SMTP settings to enable password resets and transactional emails.
                        </p>
                        <button className="admin-btn admin-btn-outline">Configure Provider</button>
                    </div>
                )
            case 'integrations':
                return (
                    <div className="animation-fade-in text-center p-5 admin-card border-0 shadow-sm d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                        <i className="pi pi-link text-muted mb-4" style={{ fontSize: '3.5rem', opacity: 0.3 }}></i>
                        <h4 className="fw-bold mb-3">Integrations</h4>
                        <p className="admin-body-text text-muted max-w-md mx-auto mb-4">
                            Connect third-party services like Google Analytics, Stripe, and Zapier.
                        </p>
                        <button className="admin-btn admin-btn-outline">Browse Directory</button>
                    </div>
                )
            case 'danger':
                return (
                    <div className="animation-fade-in">
                        <div className="admin-card border border-danger mb-4 p-5" style={{ backgroundColor: 'var(--admin-bg-soft)' }}>
                            <h5 className="fw-bold text-danger mb-4">Danger Zone</h5>
                            <div className="d-flex flex-column gap-4">
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 pb-4 border-bottom border-danger border-opacity-25">
                                    <div>
                                        <h6 className="fw-bold m-0 text-dark">Clear Cache</h6>
                                        <p className="admin-body-text text-muted m-0 mt-1">Clear all cached static assets and data queries.</p>
                                    </div>
                                    <button className="admin-btn admin-btn-outline border-danger text-danger">Clear Cache</button>
                                </div>
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                    <div>
                                        <h6 className="fw-bold m-0 text-dark">Factory Reset</h6>
                                        <p className="admin-body-text text-muted m-0 mt-1">Erase all data and reset the database to factory settings. This action is irreversible.</p>
                                    </div>
                                    <button className="admin-btn admin-btn-danger">Erase All Data</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="d-flex flex-column h-100" style={{ gap: 'var(--admin-gap-md)' }}>
            <div className="mb-2">
                <h1 className="admin-page-title mb-2">Settings</h1>
                <p className="admin-body-text mb-0">Manage global configuration, preferences, and integrations.</p>
            </div>

            <div className="row g-4 mt-2">
                <div className="col-md-3">
                    <div className="admin-card p-3 sticky-top" style={{ top: '90px' }}>
                        <div className="d-flex flex-column gap-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`btn text-start d-flex align-items-center gap-3 px-3 py-2 fw-medium transition-hover ${activeTab === tab.id ? 'bg-primary bg-opacity-10 text-primary fw-bold' : 'text-muted hover-bg'}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{ borderRadius: '8px' }}
                                >
                                    <i className={`pi ${tab.icon} ${activeTab === tab.id ? 'text-primary' : ''}`}></i>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="col-md-9">
                    {renderContent()}
                </div>
            </div>
        </div>
    )
}
