import React from 'react'
import { useLocation } from '/src/providers/LocationProvider.jsx'
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

    const navItems = [
        { path: '/', label: 'Dashboard' },
        { path: '/articles', label: 'Articles' },
        { path: '/topics', label: 'Knowledge Hub' },
        { path: '/categories', label: 'Categories' },
        { path: '/tags', label: 'Tags' },
        { path: '/media', label: 'Media' },
        { path: '/authors', label: 'Authors' },
        { path: '/publishing', label: 'Publishing' },
        { path: '/publishing/calendar', label: 'Calendar' },
        { path: '/marketing', label: 'Marketing' },
        { path: '/marketing/ctas', label: 'CTAs' },
        { path: '/marketing/campaigns', label: 'Campaigns' },
        { path: '/marketing/magnets', label: 'Lead Magnets' },
        { path: '/settings', label: 'Settings' }
    ]

    return (
        <ProtectedRoute>
            <div className="admin-layout d-flex vh-100 bg-light">
                {/* Sidebar */}
                <aside className="admin-sidebar bg-white border-end d-flex flex-column" style={{ width: '250px' }}>
                    <div className="p-4 border-bottom">
                        <h5 className="fw-bold m-0 text-primary">Project Atlas</h5>
                    </div>
                    <nav className="p-3 d-flex flex-column gap-2 flex-grow-1">
                        {navItems.map(item => (
                            <button 
                                key={item.path}
                                onClick={() => goToAdminRoute(item.path)}
                                className={`btn text-start fw-medium ${adminPath === item.path ? 'btn-light active text-primary' : 'btn-transparent text-muted'}`}
                                style={item.path === '/settings' ? { marginTop: 'auto' } : {}}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="admin-content flex-grow-1 overflow-auto bg-light">
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
                    {adminPath === '/settings' && <div className="p-4"><h4>Settings</h4></div>}
                </main>
            </div>
        </ProtectedRoute>
    )
}
