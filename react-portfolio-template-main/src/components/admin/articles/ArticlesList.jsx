import React, { useEffect, useState } from 'react'
import { useArticles } from '/src/hooks/useArticles.js'
import { useLocation } from '/src/providers/LocationProvider.jsx'

export default function ArticlesList() {
    const { fetchArticles, deleteArticle, isLoading, error } = useArticles()
    const { goToAdminRoute } = useLocation()
    const [articles, setArticles] = useState([])
    const [selectedIds, setSelectedIds] = useState([])
    
    // Filters & Pagination
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const loadArticles = async () => {
        const data = await fetchArticles({ search: searchQuery, status: statusFilter })
        const enrichedData = (data || []).map(a => ({
            ...a,
            seoScore: Math.floor(Math.random() * 30) + 70, // 70-99
            readability: ['A', 'B+', 'B', 'C'][Math.floor(Math.random() * 4)],
            views: Math.floor(Math.random() * 50000)
        }))
        setArticles(enrichedData)
    }

    useEffect(() => {
        const timer = setTimeout(() => { loadArticles() }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery, statusFilter])

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedIds(articles.map(a => a.id))
        else setSelectedIds([])
    }

    const handleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    const handleDelete = async (id) => {
        if(!window.confirm("Move this article to trash?")) return
        try {
            await deleteArticle(id)
            loadArticles()
            setSelectedIds(prev => prev.filter(x => x !== id))
        } catch(err) { alert(err.message) }
    }

    const getStatusBadge = (status) => {
        switch(status) {
            case 'published': return <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1" style={{ fontSize: '11px' }}>Published</span>
            case 'draft': return <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-2 py-1" style={{ fontSize: '11px' }}>Draft</span>
            case 'scheduled': return <span className="badge bg-info bg-opacity-10 text-info rounded-pill px-2 py-1" style={{ fontSize: '11px' }}>Scheduled</span>
            default: return <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-2 py-1" style={{ fontSize: '11px' }}>{status}</span>
        }
    }

    const formatNumber = (num) => {
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
        return num
    }

    return (
        <div className="d-flex flex-column h-100" style={{ gap: 'var(--admin-gap-md)' }}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end" style={{ gap: 'var(--admin-gap-component)' }}>
                <div>
                    <h1 className="admin-page-title mb-2">Articles</h1>
                    <p className="admin-body-text mb-0">Manage, edit, and publish your content.</p>
                </div>
                <button className="admin-btn admin-btn-primary shadow-sm" onClick={() => goToAdminRoute('/articles/new')}>
                    <i className="pi pi-plus me-1"></i> Create Article
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="admin-card p-0 d-flex flex-column flex-grow-1 overflow-hidden" style={{ minHeight: 0 }}>
                {/* Top Toolbar */}
                <div className="p-3 border-bottom border-light d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 bg-white" style={{ position: 'sticky', top: 0, zIndex: 20 }}>
                    <div className="d-flex flex-wrap gap-2 align-items-center flex-grow-1">
                        <div className="position-relative" style={{ minWidth: '280px' }}>
                            <i className="pi pi-search position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}></i>
                            <input 
                                type="text" 
                                className="form-control form-control-sm bg-light border-0 ps-5" 
                                placeholder="Search articles by title, author, or slug..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ borderRadius: '6px', fontSize: '13px' }}
                            />
                        </div>
                        <select className="form-select form-select-sm bg-light border-0 w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ borderRadius: '6px', fontSize: '13px' }}>
                            <option value="">Status: All</option>
                            <option value="published">Published</option>
                            <option value="draft">Drafts</option>
                            <option value="scheduled">Scheduled</option>
                        </select>
                        <select className="form-select form-select-sm bg-light border-0 w-auto" style={{ borderRadius: '6px', fontSize: '13px' }}>
                            <option value="">Category: All</option>
                            <option value="engineering">Engineering</option>
                            <option value="design">Design</option>
                        </select>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <button className="admin-btn-icon border border-light rounded bg-white" title="Filter" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="pi pi-filter"></i>
                        </button>
                        <button className="admin-btn-icon border border-light rounded bg-white" title="Sort" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="pi pi-sort-amount-down"></i>
                        </button>
                    </div>
                </div>

                {/* Bulk Actions Slide Down */}
                {selectedIds.length > 0 && (
                    <div className="bg-primary bg-opacity-10 border-bottom border-primary px-3 py-2 d-flex flex-row align-items-center justify-content-between" style={{ animation: 'slideDown 0.2s ease-out' }}>
                        <span className="fw-bold text-primary" style={{ fontSize: '13px' }}>{selectedIds.length} items selected</span>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-white border shadow-sm fw-medium" style={{ fontSize: '12px' }}>Publish Selected</button>
                            <button className="btn btn-sm btn-white border shadow-sm fw-medium" style={{ fontSize: '12px' }}>Unpublish</button>
                            <button className="btn btn-sm btn-danger shadow-sm fw-medium" style={{ fontSize: '12px' }}>Delete Selected</button>
                        </div>
                    </div>
                )}

                {/* Table Area */}
                <div className="flex-grow-1 overflow-auto position-relative">
                    {isLoading && articles.length === 0 ? (
                        <div className="p-5 text-center">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="p-5 text-center d-flex flex-column align-items-center justify-content-center h-100">
                            <div className="bg-light rounded d-flex align-items-center justify-content-center mb-4" style={{ width: '64px', height: '64px' }}>
                                <i className="pi pi-file text-muted" style={{ fontSize: '1.5rem' }}></i>
                            </div>
                            <h5 className="fw-bold mb-2">No Articles Found</h5>
                            <p className="admin-meta-text text-muted mb-4">Create your first article or adjust your search filters.</p>
                            <button className="admin-btn admin-btn-primary" onClick={() => goToAdminRoute('/articles/new')}>
                                Create Article
                            </button>
                        </div>
                    ) : (
                        <table className="admin-table w-100" style={{ minWidth: '900px' }}>
                            <thead className="bg-white" style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '2px solid var(--admin-border-light)' }}>
                                <tr>
                                    <th style={{ width: '40px', padding: '12px 16px' }}>
                                        <input type="checkbox" className="form-check-input border-secondary" onChange={handleSelectAll} checked={selectedIds.length === articles.length && articles.length > 0} />
                                    </th>
                                    <th style={{ padding: '12px 16px' }}>Status</th>
                                    <th style={{ padding: '12px 16px' }}>Title</th>
                                    <th style={{ padding: '12px 16px' }}>Category</th>
                                    <th style={{ padding: '12px 16px' }}>Author</th>
                                    <th style={{ padding: '12px 16px' }}>SEO</th>
                                    <th style={{ padding: '12px 16px' }}>Reads</th>
                                    <th style={{ padding: '12px 16px' }}>Views</th>
                                    <th style={{ padding: '12px 16px' }}>Updated</th>
                                    <th className="text-end" style={{ padding: '12px 16px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articles.map(article => (
                                    <tr key={article.id} className="transition-hover">
                                        <td style={{ padding: '12px 16px' }}>
                                            <input type="checkbox" className="form-check-input border-secondary" checked={selectedIds.includes(article.id)} onChange={() => handleSelect(article.id)} />
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>{getStatusBadge(article.status)}</td>
                                        <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                                            <div className="fw-bold text-dark text-truncate" style={{ fontSize: '14px' }}>{article.title}</div>
                                            <div className="admin-meta-text text-muted text-truncate">/{article.slug}</div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span className="badge bg-light border text-dark fw-medium" style={{ fontSize: '11px' }}>{article.category?.name || 'Uncategorized'}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '20px', height: '20px', fontSize: '9px' }}>
                                                    {(article.author?.full_name || 'A').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="admin-small-text fw-medium">{article.author?.full_name || 'Admin User'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className={`rounded-circle ${article.seoScore > 85 ? 'bg-success' : 'bg-warning'}`} style={{ width: '8px', height: '8px' }}></div>
                                                <span className="admin-small-text fw-medium">{article.seoScore}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span className="admin-small-text fw-bold text-muted">{article.readability}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span className="admin-small-text fw-medium">{formatNumber(article.views)}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span className="admin-meta-text">{new Date(article.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </td>
                                        <td className="text-end" style={{ padding: '12px 16px' }}>
                                            <button className="admin-btn-icon me-1 p-1 text-muted hover-text-primary" onClick={() => goToAdminRoute(`/articles/${article.id}`)} title="Edit">
                                                <i className="pi pi-pencil"></i>
                                            </button>
                                            <button className="admin-btn-icon p-1 text-muted hover-text-danger" onClick={() => handleDelete(article.id)} title="Delete">
                                                <i className="pi pi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-3 border-top border-light d-flex justify-content-between align-items-center bg-white" style={{ position: 'sticky', bottom: 0, zIndex: 20 }}>
                    <div className="admin-meta-text text-muted">Showing 1 to {articles.length} of {articles.length} results</div>
                    <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-light border px-2 py-1"><i className="pi pi-chevron-left" style={{ fontSize: '10px' }}></i></button>
                        <button className="btn btn-sm btn-primary border px-3 py-1 fw-bold" style={{ fontSize: '12px' }}>1</button>
                        <button className="btn btn-sm btn-light border px-3 py-1 fw-bold" style={{ fontSize: '12px' }}>2</button>
                        <button className="btn btn-sm btn-light border px-3 py-1 fw-bold" style={{ fontSize: '12px' }}>3</button>
                        <button className="btn btn-sm btn-light border px-2 py-1"><i className="pi pi-chevron-right" style={{ fontSize: '10px' }}></i></button>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                @keyframes slideDown {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    )
}

