import React, { useEffect, useState } from 'react'
import { useTaxonomy } from '/src/hooks/useTaxonomy.js'

export default function CategoriesManager() {
    const { fetchCategories, createCategory, updateCategory, deleteCategory, reassignAndDeleteCategory, isLoading, error } = useTaxonomy()
    
    const [categories, setCategories] = useState([])
    
    // Form state
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        description: '',
        seo_title: '',
        seo_description: '',
        parent_id: '',
        status: 'active',
        display_order: 0
    })

    // Reassignment modal state
    const [reassignData, setReassignData] = useState(null) // { oldId: uuid, oldName: string, newId: uuid }

    const loadCategories = async () => {
        const data = await fetchCategories()
        setCategories(data)
    }

    useEffect(() => {
        loadCategories()
    }, [])

    const resetForm = () => {
        setFormData({
            id: null, name: '', description: '', seo_title: '', seo_description: '', parent_id: '', status: 'active', display_order: 0
        })
        setIsEditing(false)
    }

    const handleEditStart = (cat) => {
        setFormData({
            id: cat.id,
            name: cat.name,
            description: cat.description || '',
            seo_title: cat.seo_title || '',
            seo_description: cat.seo_description || '',
            parent_id: cat.parent_id || '',
            status: cat.status || 'active',
            display_order: cat.display_order || 0
        })
        setIsEditing(true)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        if (!formData.name.trim()) return

        const payload = {
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            seo_title: formData.seo_title.trim() || null,
            seo_description: formData.seo_description.trim() || null,
            parent_id: formData.parent_id || null,
            status: formData.status,
            display_order: parseInt(formData.display_order, 10) || 0
        }

        try {
            if (formData.id) {
                await updateCategory(formData.id, payload)
            } else {
                await createCategory(payload)
            }
            resetForm()
            loadCategories()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleDeleteAttempt = async (cat) => {
        if (!window.confirm(`Are you sure you want to delete the category "${cat.name}"?`)) return
        
        try {
            await deleteCategory(cat.id)
            loadCategories()
        } catch (err) {
            // Check if it's a foreign key violation (usually implies it's still attached to articles or is a parent)
            if (err.code === '23503' || err.message.includes('foreign key') || err.message.includes('restrict')) {
                setReassignData({
                    oldId: cat.id,
                    oldName: cat.name,
                    newId: ''
                })
            } else {
                alert(`Failed to delete: ${err.message}`)
            }
        }
    }

    const handleReassignSubmit = async (e) => {
        e.preventDefault()
        if (!reassignData.newId) {
            alert("Please select a new category to inherit the articles.")
            return
        }
        try {
            await reassignAndDeleteCategory(reassignData.oldId, reassignData.newId)
            setReassignData(null)
            loadCategories()
        } catch (err) {
            alert(err.message)
        }
    }

    return (
        <div className="container-fluid p-4">
            <div className="mb-4">
                <h3 className="fw-bold m-0">Categories</h3>
                <p className="text-muted mb-0">Organize articles into hierarchical topics.</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-4">
                {/* Form Panel */}
                <div className="col-md-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <h5 className="card-title fw-bold mb-3">{isEditing ? 'Edit Category' : 'Add New Category'}</h5>
                            <form onSubmit={handleSave}>
                                <div className="mb-3">
                                    <label className="form-label small fw-medium">Name *</label>
                                    <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label small fw-medium">Parent Category</label>
                                    <select className="form-select" value={formData.parent_id} onChange={e => setFormData({...formData, parent_id: e.target.value})}>
                                        <option value="">None (Top Level)</option>
                                        {categories.filter(c => c.id !== formData.id).map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-medium">Description</label>
                                    <textarea className="form-control" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Status</label>
                                        <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                            <option value="active">Active</option>
                                            <option value="hidden">Hidden</option>
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Display Order</label>
                                        <input type="number" className="form-control" value={formData.display_order} onChange={e => setFormData({...formData, display_order: e.target.value})} />
                                    </div>
                                </div>

                                <hr/>
                                <h6 className="fw-bold small mb-2 text-muted">SEO Settings</h6>
                                
                                <div className="mb-3">
                                    <label className="form-label small fw-medium">SEO Title</label>
                                    <input type="text" className="form-control" value={formData.seo_title} onChange={e => setFormData({...formData, seo_title: e.target.value})} placeholder="Optional override" />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-medium">SEO Description</label>
                                    <textarea className="form-control" rows="2" value={formData.seo_description} onChange={e => setFormData({...formData, seo_description: e.target.value})}></textarea>
                                </div>

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary flex-grow-1" disabled={isLoading}>
                                        {isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Add Category')}
                                    </button>
                                    {isEditing && (
                                        <button type="button" className="btn btn-light" onClick={resetForm}>Cancel</button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* List Panel */}
                <div className="col-md-8">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body p-0">
                            {isLoading && categories.length === 0 ? (
                                <div className="p-5 text-center"><div className="spinner-border text-primary" /></div>
                            ) : categories.length === 0 ? (
                                <div className="p-5 text-center text-muted">No categories found.</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="ps-4">Name</th>
                                                <th>Slug</th>
                                                <th>Status</th>
                                                <th>Articles</th>
                                                <th className="text-end pe-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categories.map(cat => (
                                                <tr key={cat.id}>
                                                    <td className="ps-4">
                                                        <div className="fw-medium text-dark">{cat.name}</div>
                                                        {cat.parent_id && <small className="text-muted d-block mt-1">Child of: {categories.find(c => c.id === cat.parent_id)?.name || 'Unknown'}</small>}
                                                    </td>
                                                    <td><code className="text-muted">{cat.slug}</code></td>
                                                    <td>
                                                        <span className={`badge ${cat.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                            {cat.status}
                                                        </span>
                                                    </td>
                                                    <td><span className="badge bg-secondary rounded-pill">{cat.article_count}</span></td>
                                                    <td className="text-end pe-4">
                                                        <button className="btn btn-sm btn-light me-2" onClick={() => handleEditStart(cat)}>
                                                            <i className="fa-solid fa-pen"></i>
                                                        </button>
                                                        <button className="btn btn-sm btn-light text-danger" onClick={() => handleDeleteAttempt(cat)}>
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
            </div>

            {/* Reassignment Modal */}
            {reassignData && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom border-light">
                                <h5 className="modal-title fw-bold text-danger">Cannot Delete Category</h5>
                                <button type="button" className="btn-close" onClick={() => setReassignData(null)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p>The category <strong>"{reassignData.oldName}"</strong> currently has articles assigned to it (or is a parent to other categories). Deleting it would leave those items orphaned.</p>
                                <p className="mb-4">Please select a fallback category to migrate these articles to before deletion proceeds.</p>
                                
                                <form onSubmit={handleReassignSubmit}>
                                    <div className="mb-4">
                                        <label className="form-label fw-medium">Fallback Category</label>
                                        <select 
                                            className="form-select form-select-lg" 
                                            value={reassignData.newId} 
                                            onChange={(e) => setReassignData({...reassignData, newId: e.target.value})}
                                            required
                                        >
                                            <option value="">Select a category...</option>
                                            {categories.filter(c => c.id !== reassignData.oldId).map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="d-flex justify-content-end gap-2">
                                        <button type="button" className="btn btn-light" onClick={() => setReassignData(null)}>Cancel</button>
                                        <button type="submit" className="btn btn-danger" disabled={isLoading || !reassignData.newId}>
                                            {isLoading ? 'Reassigning...' : 'Reassign & Delete'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
