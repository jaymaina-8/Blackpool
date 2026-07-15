import React, { useState } from 'react'
import { useLocation } from '/src/providers/LocationProvider.jsx'
import { useTheme } from '/src/providers/ThemeProvider.jsx'
import ProtectedRoute from '/src/components/admin/layout/ProtectedRoute.jsx'
import Dashboard from '/src/components/admin/Dashboard.jsx'
import ArticlesList from '/src/components/admin/articles/ArticlesList.jsx'
import ArticleEditor from '/src/components/admin/articles/ArticleEditor.jsx'
import MediaLibrary from '/src/components/admin/media/MediaLibrary.jsx'
import CategoriesManager from '/src/components/admin/taxonomy/CategoriesManager.jsx'
import TagsManager from '/src/components/admin/taxonomy/TagsManager.jsx'
import MarketingDashboard from '/src/components/admin/marketing/MarketingDashboard.jsx'
import CTAsManager from '/src/components/admin/marketing/CTAsManager.jsx'
import CampaignsManager from '/src/components/admin/marketing/CampaignsManager.jsx'
import LeadMagnetsManager from '/src/components/admin/marketing/LeadMagnetsManager.jsx'
import SettingsLayout from '/src/components/admin/settings/SettingsLayout.jsx'
import AuthorDashboard from '/src/components/admin/authors/AuthorDashboard.jsx'
import TopicDashboard from '/src/components/admin/knowledge/TopicDashboard.jsx'
import PublishingDashboard from '/src/components/admin/editorial/PublishingDashboard.jsx'
import EditorialCalendar from '/src/components/admin/editorial/EditorialCalendar.jsx'
import GlobalSearch from '/src/components/admin/layout/GlobalSearch.jsx'
import QuickActions from '/src/components/admin/layout/QuickActions.jsx'
import Breadcrumbs from '/src/components/admin/layout/Breadcrumbs.jsx'
import '/src/styles/admin.scss'

export default function AdminLayout() {
    const { adminPath, goToAdminRoute } = useLocation()
    const { toggle } = useTheme()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    // Simplified Navigation per user request
    const navGroups = [
        {
            label: null,
            items: [
                { path: '/', label: 'Dashboard', icon: 'pi pi-home' }
            ]
        },
        {
            label: 'CONTENT',
            items: [
                { path: '/articles', label: 'Articles', icon: 'pi pi-file' },
                { path: '/topics', label: 'Knowledge Hub', icon: 'pi pi-sitemap' },
                { path: '/media', label: 'Media', icon: 'pi pi-image' }
            ]
        },
        {
            label: 'MARKETING',
            items: [
                { path: '/marketing', label: 'Marketing', icon: 'pi pi-chart-line' }
            ]
        },
        {
            label: 'SYSTEM',
            items: [
                { path: '/settings', label: 'Settings', icon: 'pi pi-cog' }
            ]
        }
    ]

    const handleNavigation = (path) => {
        goToAdminRoute(path)
        setIsMobileMenuOpen(false)
    }

    const isActive = (path) => {
        if (path === '/') return adminPath === '/'
        return adminPath.startsWith(path)
    }

    return (
        <ProtectedRoute>
            <div className="admin-layout d-flex vh-100 overflow-hidden">
                <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
                <QuickActions />

                {/* Sidebar Overlay (Mobile) */}
                {isMobileMenuOpen && (
                    <div className="admin-sidebar-overlay d-md-none" onClick={() => setIsMobileMenuOpen(false)}></div>
                )}

                {/* Sidebar */}
                <aside className={`admin-sidebar d-flex flex-column ${isMobileMenuOpen ? 'open' : ''}`}>
                    <div className="p-4 d-flex align-items-center gap-2 mb-2">
                        <div className="bg-primary rounded text-white d-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }}>
                            <i className="pi pi-box" style={{ fontSize: 14 }}></i>
                        </div>
                        <h6 className="fw-bold m-0" style={{ color: 'var(--admin-text-main)', letterSpacing: '-0.5px' }}>Project Atlas</h6>
                        <button className="btn btn-sm btn-icon d-md-none ms-auto" onClick={() => setIsMobileMenuOpen(false)}>
                            <i className="pi pi-times"></i>
                        </button>
                    </div>
                    <nav className="pb-3 d-flex flex-column flex-grow-1 overflow-auto">
                        {navGroups.map((group, gIdx) => (
                            <div key={gIdx} className="mb-3">
                                {group.label && (
                                    <div className="admin-sidebar-section-label">
                                        {group.label}
                                    </div>
                                )}
                                <div className="d-flex flex-column">
                                {group.items.map(item => (
                                    <button 
                                        key={item.path}
                                        onClick={() => handleNavigation(item.path)}
                                        className={`btn ${isActive(item.path) ? 'active' : 'admin-text-muted'}`}
                                    >
                                        <i className={`${item.icon} ${isActive(item.path) ? 'text-primary' : 'opacity-50'}`}></i>
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="admin-content flex-grow-1 d-flex flex-column overflow-hidden">
                    {/* Top Header */}
                    <header className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom" style={{ backgroundColor: 'var(--admin-bg-soft)', borderColor: 'var(--admin-border-light)' }}>
                        <div className="d-flex align-items-center gap-4">
                            <button className="btn btn-sm btn-icon d-md-none" onClick={() => setIsMobileMenuOpen(true)}>
                                <i className="pi pi-bars fs-5 text-secondary"></i>
                            </button>
                            <div className="d-none d-md-block">
                                <Breadcrumbs />
                            </div>
                        </div>
                        
                        <div className="d-flex align-items-center gap-3">
                            {/* Search Bar matching modern SaaS (Linear/Vercel) */}
                            <div className="d-none d-md-flex align-items-center bg-white border rounded px-3 py-1 text-muted" 
                                 style={{ width: '240px', cursor: 'text', borderColor: 'var(--admin-border-light) !important', boxShadow: 'var(--admin-shadow-sm)' }}
                                 onClick={() => setIsSearchOpen(true)}>
                                <i className="pi pi-search me-2" style={{ fontSize: '13px' }}></i>
                                <span className="admin-small-text flex-grow-1">Search...</span>
                                <div className="d-flex align-items-center gap-1 opacity-50">
                                    <span className="border rounded px-1" style={{ fontSize: '10px' }}>Ctrl</span>
                                    <span className="border rounded px-1" style={{ fontSize: '10px' }}>K</span>
                                </div>
                            </div>
                            <button className="admin-btn-icon d-md-none" onClick={() => setIsSearchOpen(true)}>
                                <i className="pi pi-search"></i>
                            </button>
                            
                            <div className="d-flex align-items-center gap-1 border-start border-light ps-3 ms-1">
                                <button className="admin-btn-icon position-relative" title="Notifications">
                                    <i className="pi pi-bell"></i>
                                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                                        <span className="visually-hidden">New alerts</span>
                                    </span>
                                </button>
                                <button className="admin-btn-icon" onClick={toggle} title="Toggle Theme">
                                    <i className="pi pi-moon"></i>
                                </button>
                            </div>
                            
                            <div className="ms-3 d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                                <div className="rounded-circle text-white d-flex align-items-center justify-content-center shadow-sm" style={{ width: 32, height: 32, fontSize: '12px', backgroundColor: 'var(--admin-color-primary)', border: '2px solid var(--admin-bg-card)' }}>
                                    A
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="flex-grow-1 overflow-auto position-relative">
                        <div className="admin-content-inner">
                            {adminPath === '/' && <Dashboard />}
                            {adminPath === '/articles' && <ArticlesList />}
                            {adminPath.startsWith('/articles/') && <ArticleEditor articleId={adminPath.replace('/articles/', '')} />}
                            {adminPath === '/topics' && <TopicDashboard />}
                            {adminPath === '/categories' && <CategoriesManager />}
                            {adminPath === '/tags' && <TagsManager />}
                            {adminPath === '/media' && <MediaLibrary />}
                            {adminPath === '/authors' && <AuthorDashboard />}
                            {adminPath === '/publishing' && <PublishingDashboard />}
                            {adminPath === '/publishing/calendar' && <EditorialCalendar />}
                            {adminPath === '/marketing' && <MarketingDashboard />}
                            {adminPath === '/marketing/ctas' && <CTAsManager />}
                            {adminPath === '/marketing/campaigns' && <CampaignsManager />}
                            {adminPath === '/marketing/magnets' && <LeadMagnetsManager />}
                            {adminPath === '/settings' && <SettingsLayout />}
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    )
}

