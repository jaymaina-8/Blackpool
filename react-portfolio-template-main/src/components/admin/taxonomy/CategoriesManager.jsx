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
        <div className="d-flex flex-column admin-gap-section pb-5">
            <div className="mb-4">
                <h2 className="admin-page-title mb-1">Categories</h2>
                <p className="admin-small-text text-muted mb-0">Organize articles into hierarchical topics.</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-4">
                {/* Form Panel */}
                <div className="col-md-4">
                    <div className="admin-card sticky-top" style={{ top: '90px' }}>
                        <h5 className="admin-card-title mb-4">{isEditing ? 'Edit Category' : 'Add New Category'}</h5>
                        <form onSubmit={handleSave} className="d-flex flex-column gap-3">
                            <div>
                                <label className="form-label admin-small-text fw-bold">Name *</label>
                                <input type="text" className="form-control bg-light border-0" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            
                            <div>
                                <label className="form-label admin-small-text fw-bold">Parent Category</label>
                                <select className="form-select bg-light border-0" value={formData.parent_id} onChange={e => setFormData({...formData, parent_id: e.target.value})}>
                                    <option value="">None (Top Level)</option>
                                    {categories.filter(c => c.id !== formData.id).map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="form-label admin-small-text fw-bold">Description</label>
                                <textarea className="form-control bg-light border-0" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>

                            <div className="row g-3">
                                <div className="col-6">
                                    <label className="form-label admin-small-text fw-bold">Status</label>
                                    <select className="form-select bg-light border-0" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                        <option value="active">Active</option>
                                        <option value="hidden">Hidden</option>
                                    </select>
                                </div>
                                <div className="col-6">
                                    <label className="form-label admin-small-text fw-bold">Display Order</label>
                                    <input type="number" className="form-control bg-light border-0" value={formData.display_order} onChange={e => setFormData({...formData, display_order: e.target.value})} />
                                </div>
                            </div>

                            <div className="border-top border-light my-2"></div>
                            <h6 className="fw-bold admin-small-text text-muted mb-0">SEO Settings</h6>
                            
                            <div>
                                <label className="form-label admin-small-text fw-bold">SEO Title</label>
                                <input type="text" className="form-control bg-light border-0" value={formData.seo_title} onChange={e => setFormData({...formData, seo_title: e.target.value})} placeholder="Optional override" />
                            </div>

                            <div>
                                <label className="form-label admin-small-text fw-bold">SEO Description</label>
                                <textarea className="form-control bg-light border-0" rows="2" value={formData.seo_description} onChange={e => setFormData({...formData, seo_description: e.target.value})}></textarea>
                            </div>

                            <div className="d-flex gap-2 mt-3">
                                <button type="submit" className="admin-btn admin-btn-primary flex-grow-1" disabled={isLoading}>
                                    {isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Add Category')}
                                </button>
                                {isEditing && (
                                    <button type="button" className="admin-btn admin-btn-outline" onClick={resetForm}>Cancel</button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Panel */}
                <div className="col-md-8">
                    <div className="admin-table-container h-100">
                        {isLoading && categories.length === 0 ? (
                            <div className="p-5 text-center"><div className="spinner-border text-primary" /></div>
                        ) : categories.length === 0 ? (
                            <div className="p-5 text-center text-muted">
                                <i className="pi pi-folder-open fs-1 mb-3 opacity-50"></i>
                                <h5>No categories found.</h5>
                                <p className="admin-small-text">Create your first category on the left to get started.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Slug</th>
                                            <th>Status</th>
                                            <th>Articles</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map(cat => (
                                            <tr key={cat.id}>
                                                <td>
                                                    <div className="fw-bold text-dark">{cat.name}</div>
                                                    {cat.parent_id && <div className="admin-small-text text-muted mt-1">Child of: {categories.find(c => c.id === cat.parent_id)?.name || 'Unknown'}</div>}
                                                </td>
                                                <td><code className="bg-light px-2 py-1 rounded border border-light text-muted admin-small-text">{cat.slug}</code></td>
                                                <td>
                                                    <span className={`badge bg-${cat.status === 'active' ? 'success' : 'secondary'} bg-opacity-10 text-${cat.status === 'active' ? 'success' : 'secondary'} rounded-pill fw-normal`}>
                                                        {cat.status}
                                                    </span>
                                                </td>
                                                <td><span className="badge bg-light text-dark border rounded-pill">{cat.article_count}</span></td>
                                                <td className="text-end">
                                                    <button className="admin-btn-icon me-2" onClick={() => handleEditStart(cat)} title="Edit">
                                                        <i className="pi pi-pencil"></i>
                                                    </button>
                                                    <button className="admin-btn-icon text-danger" onClick={() => handleDeleteAttempt(cat)} title="Delete">
                                                        <i className="pi pi-trash"></i>
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

            {/* Reassignment Modal */}
            {reassignData && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-header bg-danger bg-opacity-10 border-0 p-4">
                                <h5 className="modal-title fw-bold text-danger d-flex align-items-center gap-2">
                                    <i className="pi pi-exclamation-triangle"></i> Cannot Delete Category
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setReassignData(null)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p className="mb-3">The category <strong className="text-dark">"{reassignData.oldName}"</strong> currently has articles assigned to it (or is a parent to other categories). Deleting it would leave those items orphaned.</p>
                                <p className="mb-4 text-muted admin-small-text">Please select a fallback category to migrate these articles to before deletion proceeds.</p>
                                
                                <form onSubmit={handleReassignSubmit}>
                                    <div className="mb-4">
                                        <label className="form-label admin-small-text fw-bold">Fallback Category</label>
                                        <select 
                                            className="form-select form-select-lg bg-light border-0" 
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
                                        <button type="button" className="admin-btn admin-btn-outline" onClick={() => setReassignData(null)}>Cancel</button>
                                        <button type="submit" className="admin-btn admin-btn-primary bg-danger border-danger hover-bg" disabled={isLoading || !reassignData.newId}>
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
