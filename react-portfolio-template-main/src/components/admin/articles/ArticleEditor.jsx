import React, { useEffect, useState, useRef } from 'react'
import { useArticles } from '/src/hooks/useArticles.js'
import { useTaxonomy } from '/src/hooks/useTaxonomy.js'
import { useLocation } from '/src/providers/LocationProvider.jsx'
import { useMedia } from '/src/hooks/useMedia.js'
import { supabase } from '/src/utils/supabase.js'
import BlockEditor from '/src/components/admin/articles/BlockEditor.jsx'
import { useSeoEngine } from '/src/hooks/useSeoEngine.js'
import PublishingReadiness from '/src/components/admin/editorial/PublishingReadiness.jsx'
import PublishingPanel from '/src/components/admin/editorial/PublishingPanel.jsx'
import ArticleLockBanner from '/src/components/admin/editorial/ArticleLockBanner.jsx'
import WorkflowTimeline from '/src/components/admin/editorial/WorkflowTimeline.jsx'
import RevisionHistory from '/src/components/admin/editorial/RevisionHistory.jsx'
import { useArticleVersions } from '/src/hooks/useArticleVersions.js'
import ArticleAnalytics from '/src/components/admin/editorial/ArticleAnalytics.jsx'
import SmartLinkAssistant from '/src/components/admin/knowledge/SmartLinkAssistant.jsx'

export default function ArticleEditor({ articleId }) {
    const { fetchArticleById, createArticle, updateArticle, generateSlug, validateSlug, isLoading: savingArticle } = useArticles()
    const { fetchCategories, fetchTags } = useTaxonomy()
    const { uploadMedia, isUploading } = useMedia()
    const { goToAdminRoute } = useLocation()
    const { saveVersion } = useArticleVersions()
    
    const isNew = articleId === 'new'
    
    // Core state
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [isSlugLocked, setIsSlugLocked] = useState(false)
    const [status, setStatus] = useState('draft')
    const [isFeatured, setIsFeatured] = useState(false)
    const [isPillar, setIsPillar] = useState(false)
    const [content, setContent] = useState(undefined)
    const [htmlContent, setHtmlContent] = useState('')
    
    // Taxonomy state
    const [categoryId, setCategoryId] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [availableCategories, setAvailableCategories] = useState([])
    const [availableTags, setAvailableTags] = useState([])

    // Media & SEO state
    const [coverImageId, setCoverImageId] = useState(null)
    const [coverImageUrl, setCoverImageUrl] = useState(null)
    const [seoTitle, setSeoTitle] = useState('')
    const [seoDesc, setSeoDesc] = useState('')

    // Autosave & Unsaved Changes State
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [isAutosaving, setIsAutosaving] = useState(false)
    const [lastSaved, setLastSaved] = useState(null)
    const [fullArticle, setFullArticle] = useState(null)
    const [showAnalytics, setShowAnalytics] = useState(false)
    const [showLinkAssistant, setShowLinkAssistant] = useState(false)
    const isInitialLoad = useRef(true)

    // Load Data
    useEffect(() => {
        const init = async () => {
            const [cats, tags] = await Promise.all([fetchCategories(), fetchTags()])
            setAvailableCategories(cats || [])
            setAvailableTags(tags || [])

            if (!isNew) {
                const article = await fetchArticleById(articleId)
                if (article) {
                    setTitle(article.title)
                    setSlug(article.slug)
                    setIsSlugLocked(true)
                    setStatus(article.status || 'draft')
                    setIsFeatured(article.is_featured || false)
                    setIsPillar(article.is_pillar || false)
                    setContent(article.content || undefined)
                    setHtmlContent(article.html_content || '')
                    setCategoryId(article.category_id || '')
                    setSelectedTags(article.article_tags?.map(t => t.tag_id) || [])
                    setCoverImageId(article.cover_image_id)
                    setSeoTitle(article.seo_title || '')
                    setSeoDesc(article.seo_description || '')
                    
                    if (article.cover) {
                       const { data } = supabase.storage.from('media').getPublicUrl(article.cover.storage_path)
                       setCoverImageUrl(data.publicUrl)
                    }
                    setFullArticle(article)
                }
            }
            // Allow a small delay to prevent initial mount from triggering unsaved changes
            setTimeout(() => { isInitialLoad.current = false }, 500)
        }
        init()
    }, [articleId])

    // Unsaved Changes tracking
    useEffect(() => {
        if (!isInitialLoad.current) {
            setHasUnsavedChanges(true)
        }
    }, [title, slug, content, categoryId, selectedTags, coverImageId, seoTitle, seoDesc, isFeatured, isPillar])

    // BeforeUnload Protection
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasUnsavedChanges])

    // Autosave Effect
    useEffect(() => {
        if (isNew || !hasUnsavedChanges || isInitialLoad.current) return

        const timer = setTimeout(async () => {
            setIsAutosaving(true)
            try {
                await handleSave(status, true)
            } catch (err) {
                console.error("Autosave failed", err)
            } finally {
                setIsAutosaving(false)
            }
        }, 2000)

        return () => clearTimeout(timer)
    }, [title, slug, content, htmlContent, categoryId, selectedTags, coverImageId, seoTitle, seoDesc, isFeatured, isPillar, hasUnsavedChanges])

    // Handlers
    const handleTitleChange = (e) => {
        const newTitle = e.target.value
        setTitle(newTitle)
        if (!isSlugLocked) {
            setSlug(generateSlug(newTitle))
        }
    }

    const handleSlugChange = (e) => {
        setSlug(e.target.value)
        setIsSlugLocked(true)
    }

    const handleContentChange = ({ json, html }) => {
        setContent(json)
        setHtmlContent(html)
    }

    const handleBlockNoteUpload = async (file) => {
        const mediaRecord = await uploadMedia(file)
        const { data } = supabase.storage.from('media').getPublicUrl(mediaRecord.storage_path)
        return data.publicUrl
    }

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        try {
            const mediaRecord = await uploadMedia(file)
            setCoverImageId(mediaRecord.id)
            setCoverImageUrl(URL.createObjectURL(file))
        } catch (err) {
            alert('Cover upload failed: ' + err.message)
        }
    }

    const handleSave = async (targetStatus = status, isSilent = false) => {
        try {
            const payload = {
                title,
                slug,
                status: targetStatus,
                is_featured: isFeatured,
                is_pillar: isPillar,
                content,
                html_content: htmlContent,
                category_id: categoryId || null,
                cover_image_id: coverImageId || null,
                seo_title: seoTitle || null,
                seo_description: seoDesc || null
            }

            if (targetStatus === 'published' && status !== 'published') {
                payload.published_at = new Date().toISOString()
            }

            if (isNew) {
                const newArticle = await createArticle(payload, selectedTags)
                setHasUnsavedChanges(false)
                goToAdminRoute(`/articles/${newArticle.id}`)
                if(!isSilent) alert('Article created successfully')
            } else {
                const savedArticle = await updateArticle(articleId, payload, selectedTags)
                setStatus(targetStatus)
                setHasUnsavedChanges(false)
                
                // Keep fullArticle in sync for child components
                if (savedArticle) {
                    setFullArticle(savedArticle)
                }

                // If not silent save, log revision
                if (!isSilent) {
                    await saveVersion(
                        savedArticle?.id || articleId, 
                        title, 
                        slug, 
                        content, 
                        htmlContent, 
                        `Saved as ${targetStatus}`
                    )
                }

                setLastSaved(new Date())
                if(!isSilent) alert('Article saved successfully')
            }
        } catch (err) {
            if(!isSilent) alert(err.message)
            else console.error(err)
        }
    }

    const toggleTag = (tagId) => {
        setSelectedTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId])
    }

    const contentWords = htmlContent ? Math.max(0, htmlContent.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(w => w.length > 0).length) : 0
    const { score: seoScore, rules: seoRules, color: seoColor } = useSeoEngine({ 
        title, 
        seoTitle, 
        seoDesc, 
        contentHtml: htmlContent, 
        categoryId, 
        coverImageId, 
        contentWords 
    })

    const handlePublishClick = () => {
        const canPublishRaw = title.trim().length > 0 && Array.isArray(content) && content.length > 0
        if (!canPublishRaw || seoScore < 80) {
            const confirm = window.confirm(`Warning: Your SEO score is ${seoScore}/100 and there are missing checklist items. Are you sure you want to publish?`)
            if (!confirm) return
        }
        handleSave('published')
    }

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <button className="btn btn-sm btn-link text-muted px-0 mb-2 text-decoration-none" onClick={() => goToAdminRoute('/articles')}>
                        <i className="fa-solid fa-arrow-left me-1"></i> Back to Articles
                    </button>
                    <div className="d-flex align-items-center gap-3">
                        <h3 className="fw-bold m-0">{isNew ? 'New Article' : 'Edit Article'}</h3>
                        {!isNew && (
                            <span className="badge bg-light text-muted border">
                                {isAutosaving ? 'Saving...' : hasUnsavedChanges ? 'Unsaved changes' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Saved'}
                            </span>
                        )}
                    </div>
                </div>
                <div className="d-flex gap-2">
                    {!isNew && (
                        <>
                            <button className="btn btn-outline-secondary shadow-sm bg-white" onClick={() => setShowLinkAssistant(true)}>
                                <i className="fa-solid fa-link me-2"></i>Link Assistant
                            </button>
                            <button className="btn btn-outline-primary shadow-sm bg-white" onClick={() => setShowAnalytics(true)}>
                                <i className="fa-solid fa-chart-line me-2"></i>Insights
                            </button>
                        </>
                    )}
                    <button className="btn btn-light shadow-sm" onClick={() => handleSave('draft')} disabled={savingArticle}>
                        {savingArticle && !isAutosaving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button 
                        className="btn btn-primary shadow-sm" 
                        onClick={handlePublishClick} 
                        disabled={savingArticle}
                    >
                        {status === 'published' ? 'Update Published' : 'Publish'}
                    </button>
                </div>
            </div>

            {!isNew && <ArticleLockBanner articleId={articleId} />}

            <div className="row g-4 mt-1">
                {/* MAIN COLUMN */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-body">
                            <input 
                                type="text" 
                                className="form-control form-control-lg border-0 fw-bold fs-2 mb-2 px-0 shadow-none" 
                                placeholder="Article Title" 
                                value={title}
                                onChange={handleTitleChange}
                            />
                            <div className="d-flex align-items-center text-muted small">
                                <span className="me-2">Permalink:</span>
                                <code>/blog/</code>
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm border-0 bg-light d-inline-block p-1 ms-1" 
                                    style={{width: '200px', fontSize: '12px'}}
                                    value={slug}
                                    onChange={handleSlugChange}
                                    placeholder="article-slug"
                                />
                                {isSlugLocked && (
                                    <button className="btn btn-sm btn-link text-muted py-0" onClick={() => {
                                        setIsSlugLocked(false)
                                        setSlug(generateSlug(title))
                                    }}>
                                        <i className="fa-solid fa-unlock-keyhole" title="Unlock slug generation"></i>
                                    </button>
                                )}
                            </div>

                            <div className="d-flex align-items-center text-muted small mb-4 gap-3">
                                <span><i className="fa-solid fa-calculator me-1"></i> {htmlContent ? Math.max(0, htmlContent.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(w => w.length > 0).length) : 0} words</span>
                                <span><i className="fa-regular fa-clock me-1"></i> {htmlContent ? Math.max(1, Math.ceil(htmlContent.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(w => w.length > 0).length / 250)) : 1} min read</span>
                            </div>

                            {!isInitialLoad.current && (
                                <BlockEditor 
                                    initialContent={content} 
                                    onChange={handleContentChange} 
                                    onUploadFile={handleBlockNoteUpload}
                                />
                            )}
                        </div>
                    </div>

                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white fw-bold py-3">SEO Metadata</div>
                        <div className="card-body">
                            <div className="mb-3">
                                <div className="d-flex justify-content-between">
                                    <label className="form-label small fw-medium">SEO Title</label>
                                    <small className={seoTitle.length > 60 ? 'text-danger' : 'text-muted'}>{seoTitle.length}/60</small>
                                </div>
                                <input type="text" className="form-control" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Leave blank to use article title" />
                            </div>
                            <div>
                                <div className="d-flex justify-content-between">
                                    <label className="form-label small fw-medium">Meta Description</label>
                                    <small className={seoDesc.length > 160 ? 'text-danger' : 'text-muted'}>{seoDesc.length}/160</small>
                                </div>
                                <textarea className="form-control" rows="3" value={seoDesc} onChange={e => setSeoDesc(e.target.value)} placeholder="Brief summary for search engines..."></textarea>
                            </div>
                        </div>
                    </div>

                    {!isNew && (
                        <>
                            <RevisionHistory 
                                articleId={articleId} 
                                onRestore={(ver) => {
                                    if(window.confirm('Restore this version? Unsaved changes will be lost.')){
                                        setTitle(ver.title)
                                        setContent(ver.content_json)
                                        setHtmlContent(ver.html_content)
                                        setHasUnsavedChanges(true)
                                    }
                                }} 
                            />
                            <WorkflowTimeline articleId={articleId} currentStatus={status} />
                        </>
                    )}
                </div>

                {/* SIDEBAR */}
                <div className="col-lg-4">
                    <PublishingReadiness article={{
                        title, slug, status, is_featured: isFeatured, is_pillar: isPillar, content, html_content: htmlContent,
                        category_id: categoryId, cover_image_id: coverImageId, seo_title: seoTitle, seo_description: seoDesc,
                        tags: selectedTags, word_count: contentWords, ...fullArticle
                    }} />

                    {!isNew && (
                        <PublishingPanel 
                            article={fullArticle} 
                            onStatusChange={(newStatus) => {
                                setStatus(newStatus)
                                setFullArticle({...fullArticle, status: newStatus})
                            }} 
                        />
                    )}

                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white fw-bold py-3">Taxonomy</div>
                        <div className="card-body">
                            <div className="mb-4">
                                <label className="form-label small fw-medium">Category</label>
                                <select className="form-select mb-3" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                                    <option value="">Select a category...</option>
                                    {availableCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                
                                <div className="form-check form-switch mb-3">
                                    <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        id="isFeaturedSwitch" 
                                        checked={isFeatured} 
                                        onChange={e => setIsFeatured(e.target.checked)} 
                                    />
                                    <label className="form-check-label small" htmlFor="isFeaturedSwitch">
                                        ⭐ Featured Article
                                    </label>
                                </div>
                                <div className="form-check form-switch mb-3">
                                    <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        id="isPillarSwitch" 
                                        checked={isPillar} 
                                        onChange={e => setIsPillar(e.target.checked)} 
                                    />
                                    <label className="form-check-label small text-warning fw-bold" htmlFor="isPillarSwitch">
                                        ⭐ Complete Guide (Pillar)
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="form-label small fw-medium">Tags</label>
                                <div className="border rounded p-2 bg-light" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    {availableTags.length === 0 ? <small className="text-muted">No tags available.</small> : availableTags.map(tag => (
                                        <div key={tag.id} className="form-check">
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                id={`tag-${tag.id}`} 
                                                checked={selectedTags.includes(tag.id)}
                                                onChange={() => toggleTag(tag.id)}
                                            />
                                            <label className="form-check-label small" htmlFor={`tag-${tag.id}`}>
                                                {tag.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white fw-bold py-3">Cover Image</div>
                        <div className="card-body text-center">
                            {coverImageUrl ? (
                                <div className="mb-3">
                                    <img src={coverImageUrl} alt="Cover" className="img-fluid rounded shadow-sm" />
                                    <button className="btn btn-sm btn-link text-danger mt-2 text-decoration-none" onClick={() => {setCoverImageId(null); setCoverImageUrl(null);}}>Remove Image</button>
                                </div>
                            ) : (
                                <div className="p-4 border border-dashed rounded bg-light transition-all">
                                    <i className="fa-regular fa-image fs-1 text-muted mb-2 opacity-50"></i>
                                    <div className="mt-2">
                                        <input type="file" id="cover-upload" className="d-none" accept="image/jpeg, image/png, image/webp" onChange={handleCoverUpload} disabled={isUploading} />
                                        <label htmlFor="cover-upload" className="btn btn-sm btn-outline-primary" style={{cursor: 'pointer'}}>
                                            {isUploading ? 'Uploading...' : 'Upload Image'}
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {showAnalytics && !isNew && (
                <ArticleAnalytics articleId={articleId} onClose={() => setShowAnalytics(false)} />
            )}
            
            {showLinkAssistant && !isNew && (
                <SmartLinkAssistant 
                    articleId={articleId}
                    categoryId={categoryId}
                    onClose={() => setShowLinkAssistant(false)} 
                />
            )}
        </div>
    )
}
