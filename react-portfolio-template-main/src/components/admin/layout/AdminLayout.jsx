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
import AuthorDashboard from '/src/components/admin/authors/AuthorDashboard.jsx'
import TopicDashboard from '/src/components/admin/knowledge/TopicDashboard.jsx'
import PublishingDashboard from '/src/components/admin/editorial/PublishingDashboard.jsx'
import EditorialCalendar from '/src/components/admin/editorial/EditorialCalendar.jsx'
import '/src/styles/admin.scss'

export default function AdminLayout() {
    const { adminPath, goToAdminRoute } = useLocation()
    const { toggle } = useTheme()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const navItems = [
        { path: '/', label: 'Dashboard', icon: 'pi pi-home' },
        { path: '/articles', label: 'Articles', icon: 'pi pi-file' },
        { path: '/topics', label: 'Knowledge Hub', icon: 'pi pi-sitemap' },
        { path: '/categories', label: 'Categories', icon: 'pi pi-tags' },
        { path: '/tags', label: 'Tags', icon: 'pi pi-hashtag' },
        { path: '/media', label: 'Media', icon: 'pi pi-image' },
        { path: '/authors', label: 'Authors', icon: 'pi pi-users' },
        { path: '/publishing', label: 'Publishing', icon: 'pi pi-send' },
        { path: '/publishing/calendar', label: 'Calendar', icon: 'pi pi-calendar' },
        { path: '/marketing', label: 'Marketing', icon: 'pi pi-chart-line' },
        { path: '/marketing/ctas', label: 'CTAs', icon: 'pi pi-bullseye' },
        { path: '/marketing/campaigns', label: 'Campaigns', icon: 'pi pi-megaphone' },
        { path: '/marketing/magnets', label: 'Lead Magnets', icon: 'pi pi-download' },
        { path: '/settings', label: 'Settings', icon: 'pi pi-cog' }
    ]

    const handleNavigation = (path) => {
        goToAdminRoute(path)
        setIsMobileMenuOpen(false)
    }

    return (
        <ProtectedRoute>
            <div className="admin-layout d-flex flex-column flex-md-row vh-100">
                {/* Mobile Topbar */}
                <div className="admin-mobile-header d-md-none d-flex justify-content-between align-items-center p-3 border-bottom">
                    <h5 className="fw-bold m-0 text-primary">Project Atlas</h5>
                    <div className="d-flex gap-3 align-items-center">
                        <button className="btn btn-sm btn-icon" onClick={toggle} title="Toggle Theme">
                            <i className="pi pi-moon"></i>
                        </button>
                        <button className="btn btn-sm btn-icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <i className="pi pi-bars fs-4"></i>
                        </button>
                    </div>
                </div>

                {/* Sidebar Overlay (Mobile) */}
                {isMobileMenuOpen && (
                    <div className="admin-sidebar-overlay d-md-none" onClick={() => setIsMobileMenuOpen(false)}></div>
                )}

                {/* Sidebar */}
                <aside className={`admin-sidebar border-end d-flex flex-column ${isMobileMenuOpen ? 'open' : ''}`}>
                    <div className="p-4 border-bottom d-none d-md-flex justify-content-between align-items-center">
                        <h5 className="fw-bold m-0 text-primary">Project Atlas</h5>
                        <button className="btn btn-sm btn-icon admin-theme-toggle" onClick={toggle} title="Toggle Theme">
                            <i className="pi pi-moon"></i>
                        </button>
                    </div>
                    <nav className="p-3 d-flex flex-column gap-2 flex-grow-1 overflow-auto">
                        {navItems.map(item => (
                            <button 
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                className={`btn text-start fw-medium d-flex align-items-center gap-2 ${adminPath === item.path ? 'active text-primary' : 'admin-text-muted'}`}
                                style={item.path === '/settings' ? { marginTop: 'auto' } : {}}
                            >
                                <i className={item.icon}></i>
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="admin-content flex-grow-1 overflow-auto">
                    <div className="admin-content-inner p-3 p-md-4">
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
                        {adminPath === '/settings' && <div><h4>Settings</h4></div>}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    )
}
