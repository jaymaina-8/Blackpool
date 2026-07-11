import React, { useEffect, useState } from 'react'
import { useArticles } from '/src/hooks/useArticles.js'
import { useLocation } from '/src/providers/LocationProvider.jsx'

export default function ArticlesList() {
    const { fetchArticles, deleteArticle, isLoading, error } = useArticles()
    const { goToAdminRoute } = useLocation()
    const [articles, setArticles] = useState([])
    const [selectedIds, setSelectedIds] = useState([])
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    const loadArticles = async () => {
        const data = await fetchArticles({ search: searchQuery, status: statusFilter })
        setArticles(data || [])
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
            case 'published': return <span className="badge bg-success">Published</span>
            case 'draft': return <span className="badge bg-secondary">Draft</span>
            case 'scheduled': return <span className="badge bg-info text-dark">Scheduled</span>
            case 'archived': return <span className="badge bg-dark">Archived</span>
            case 'deleted': return <span className="badge bg-danger">Trashed</span>
            default: return <span className="badge bg-secondary">{status}</span>
        }
    }

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold m-0">Articles</h3>
                    <p className="text-muted mb-0">Manage all your blog posts and content.</p>
                </div>
                <button className="btn btn-primary shadow-sm" onClick={() => goToAdminRoute('/articles/new')}>
                    <i className="fa-solid fa-plus me-2"></i> New Article
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="bg-white p-3 rounded border mb-4 d-flex gap-3 align-items-center shadow-sm flex-wrap">
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search titles..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ maxWidth: '300px' }}
                />
                <select className="form-select w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Drafts</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="archived">Archived</option>
                </select>
                
                {selectedIds.length > 0 && (
                    <div className="ms-auto d-flex align-items-center gap-2">
                        <span className="text-muted small fw-medium">{selectedIds.length} selected</span>
                        <select className="form-select form-select-sm w-auto">
                            <option value="">Bulk Actions</option>
                            <option value="publish">Publish</option>
                            <option value="draft">Revert to Draft</option>
                            <option value="delete">Move to Trash</option>
                        </select>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => alert('Bulk actions not yet implemented in V1.')}>Apply</button>
                    </div>
                )}
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    {isLoading && articles.length === 0 ? (
                        <div className="p-5 text-center"><div className="spinner-border text-primary" /></div>
                    ) : articles.length === 0 ? (
                        <div className="p-5 text-center text-muted">
                            <i className="fa-regular fa-file-lines fs-1 mb-3 opacity-50"></i>
                            <h5>No articles found.</h5>
                            <p>Try adjusting your search or create a new article.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4" style={{width: '40px'}}>
                                            <input type="checkbox" className="form-check-input" onChange={handleSelectAll} checked={selectedIds.length === articles.length && articles.length > 0} />
                                        </th>
                                        <th>Title</th>
                                        <th>Status</th>
                                        <th>Category</th>
                                        <th>Author</th>
                                        <th>Last Updated</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {articles.map(article => (
                                        <tr key={article.id}>
                                            <td className="ps-4">
                                                <input type="checkbox" className="form-check-input" checked={selectedIds.includes(article.id)} onChange={() => handleSelect(article.id)} />
                                            </td>
                                            <td>
                                                <div className="fw-medium text-dark">{article.title}</div>
                                                <small className="text-muted">/{article.slug}</small>
                                            </td>
                                            <td>{getStatusBadge(article.status)}</td>
                                            <td><span className="badge bg-light text-dark border">{article.category?.name || 'Uncategorized'}</span></td>
                                            <td><small className="text-muted">{article.author?.full_name || 'Unknown'}</small></td>
                                            <td><small className="text-muted">{new Date(article.updated_at).toLocaleDateString()}</small></td>
                                            <td className="text-end pe-4">
                                                <button className="btn btn-sm btn-light me-2" onClick={() => goToAdminRoute(`/articles/${article.id}`)}>
                                                    <i className="fa-solid fa-pen"></i>
                                                </button>
                                                <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(article.id)}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
