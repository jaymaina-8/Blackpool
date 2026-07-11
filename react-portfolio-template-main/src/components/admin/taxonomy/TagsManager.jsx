import React, { useEffect, useState } from 'react'
import { useTaxonomy } from '/src/hooks/useTaxonomy.js'

export default function TagsManager() {
    const { fetchTags, createTag, updateTag, deleteTag, isLoading, error } = useTaxonomy()
    const [tags, setTags] = useState([])
    const [newTagName, setNewTagName] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editValue, setEditValue] = useState('')

    const loadTags = async () => {
        const data = await fetchTags()
        setTags(data)
    }

    useEffect(() => {
        loadTags()
    }, [])

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!newTagName.trim()) return
        try {
            await createTag(newTagName.trim())
            setNewTagName('')
            loadTags()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleEditStart = (tag) => {
        setEditingId(tag.id)
        setEditValue(tag.name)
    }

    const handleEditSave = async (id) => {
        try {
            await updateTag(id, editValue.trim())
            setEditingId(null)
            loadTags()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this tag? It will be removed from all articles.")) return
        try {
            await deleteTag(id)
            loadTags()
        } catch (err) {
            alert(err.message)
        }
    }

    return (
        <div className="container-fluid p-4">
            <div className="mb-4">
                <h3 className="fw-bold m-0">Tags</h3>
                <p className="text-muted mb-0">Manage global tags for your articles.</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <h5 className="card-title fw-bold mb-3">Add New Tag</h5>
                            <form onSubmit={handleCreate}>
                                <div className="mb-3">
                                    <label className="form-label small fw-medium">Tag Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={newTagName} 
                                        onChange={(e) => setNewTagName(e.target.value)} 
                                        placeholder="e.g. Technology" 
                                        required
                                        disabled={isLoading}
                                    />
                                    <div className="form-text" style={{fontSize: '11px'}}>
                                        Slugs are auto-generated. Tags are case-insensitive unique.
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary w-100" disabled={isLoading || !newTagName.trim()}>
                                    {isLoading ? 'Saving...' : 'Add Tag'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-0">
                            {isLoading && tags.length === 0 ? (
                                <div className="p-5 text-center"><div className="spinner-border text-primary" /></div>
                            ) : tags.length === 0 ? (
                                <div className="p-5 text-center text-muted">No tags found.</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="ps-4">Name</th>
                                                <th>Slug</th>
                                                <th>Articles</th>
                                                <th className="text-end pe-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tags.map(tag => (
                                                <tr key={tag.id}>
                                                    <td className="ps-4">
                                                        {editingId === tag.id ? (
                                                            <div className="d-flex gap-2">
                                                                <input 
                                                                    type="text" 
                                                                    className="form-control form-control-sm" 
                                                                    value={editValue} 
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                />
                                                                <button className="btn btn-sm btn-success" onClick={() => handleEditSave(tag.id)}>Save</button>
                                                                <button className="btn btn-sm btn-light" onClick={() => setEditingId(null)}>Cancel</button>
                                                            </div>
                                                        ) : (
                                                            <span className="fw-medium">{tag.name}</span>
                                                        )}
                                                    </td>
                                                    <td><code className="text-muted">{tag.slug}</code></td>
                                                    <td><span className="badge bg-secondary rounded-pill">{tag.article_count}</span></td>
                                                    <td className="text-end pe-4">
                                                        <button 
                                                            className="btn btn-sm btn-light me-2" 
                                                            onClick={() => handleEditStart(tag)}
                                                            disabled={editingId === tag.id}
                                                        >
                                                            <i className="fa-solid fa-pen"></i>
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-light text-danger" 
                                                            onClick={() => handleDelete(tag.id)}
                                                            disabled={editingId === tag.id}
                                                        >
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
        </div>
    )
}
