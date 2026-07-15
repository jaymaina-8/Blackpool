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
                
                if (savedArticle) setFullArticle(savedArticle)

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
    const { score: seoScore } = useSeoEngine({ 
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
        <div className="d-flex flex-column h-100 bg-light" style={{ marginLeft: '-var(--admin-sidebar-width)', paddingLeft: 'var(--admin-sidebar-width)', minHeight: '100vh' }}>
            {/* Top Bar Workspace Style */}
            <div className="d-flex justify-content-between align-items-center bg-white px-4 py-3 border-bottom border-light sticky-top" style={{ zIndex: 100 }}>
                <div className="d-flex align-items-center gap-3">
                    <button className="admin-btn-icon text-muted bg-light" onClick={() => goToAdminRoute('/articles')}>
                        <i className="pi pi-arrow-left"></i>
                    </button>
                    <div className="fw-medium text-dark admin-small-text d-none d-md-block">
                        <span className="text-muted">Articles</span> / {isNew ? 'New Article' : 'Edit Article'}
                    </div>
                    {!isNew && (
                        <div className="d-flex align-items-center gap-2 admin-small-text ms-3 border-start ps-3 border-light">
                            {isAutosaving ? (
                                <><span className="spinner-border spinner-border-sm text-primary" role="status"></span> Saving...</>
                            ) : hasUnsavedChanges ? (
                                <><i className="pi pi-circle-fill text-warning" style={{fontSize:'8px'}}></i> Unsaved changes</>
                            ) : lastSaved ? (
                                <><i className="pi pi-check text-success"></i> Saved {lastSaved.toLocaleTimeString()}</>
                            ) : (
                                <><i className="pi pi-check text-success"></i> Saved</>
                            )}
                        </div>
                    )}
                </div>
                <div className="d-flex gap-2 align-items-center">
                    {!isNew && (
                        <>
                            <button className="admin-btn admin-btn-ghost text-muted hover-bg" onClick={() => setShowLinkAssistant(true)}>
                                <i className="pi pi-link me-2"></i>Link Assistant
                            </button>
                            <button className="admin-btn admin-btn-ghost text-muted hover-bg" onClick={() => setShowAnalytics(true)}>
                                <i className="pi pi-chart-line me-2"></i>Insights
                            </button>
                        </>
                    )}
                    <button className="admin-btn admin-btn-outline shadow-sm bg-white" onClick={() => handleSave('draft')} disabled={savingArticle}>
                        {savingArticle && !isAutosaving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button 
                        className="admin-btn admin-btn-primary shadow-sm" 
                        onClick={handlePublishClick} 
                        disabled={savingArticle}
                    >
                        {status === 'published' ? 'Update Published' : 'Publish'}
                    </button>
                </div>
            </div>

            {!isNew && <ArticleLockBanner articleId={articleId} />}

            <div className="d-flex flex-grow-1 overflow-hidden">
                {/* MAIN COLUMN (Writing Workspace - Notion Style) */}
                <div className="flex-grow-1 overflow-auto p-0 p-md-4 p-lg-5 d-flex justify-content-center" style={{ backgroundColor: 'var(--admin-bg-soft)' }}>
                    <div className="bg-white shadow-sm w-100" style={{ maxWidth: '1000px', borderRadius: 'var(--admin-radius-card)', minHeight: '800px', overflow: 'hidden', border: '1px solid var(--admin-border-subtle)' }}>
                        
                        {/* Cover Image Header */}
                        {coverImageUrl ? (
                            <div className="position-relative w-100" style={{ height: '300px', backgroundColor: 'var(--admin-bg-sidebar)' }}>
                                <img src={coverImageUrl} alt="Cover" className="w-100 h-100 object-fit-cover" />
                                <div className="position-absolute top-0 end-0 p-3 d-flex gap-2 opacity-0 hover-opacity-100 transition-all" style={{ opacity: 0.8 }}>
                                    <label htmlFor="cover-upload" className="btn btn-sm btn-light border shadow-sm fw-medium d-flex align-items-center gap-2" style={{cursor: 'pointer'}}>
                                        <i className="pi pi-image"></i> Change Cover
                                    </label>
                                    <input type="file" id="cover-upload" className="d-none" accept="image/jpeg, image/png, image/webp" onChange={handleCoverUpload} disabled={isUploading} />
                                    
                                    <button className="btn btn-sm btn-danger shadow-sm d-flex align-items-center gap-2" onClick={() => {setCoverImageId(null); setCoverImageUrl(null);}}>
                                        <i className="pi pi-trash"></i> Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-100 px-5 pt-5 pb-0">
                                <label htmlFor="cover-upload" className="admin-btn admin-btn-ghost text-muted d-inline-flex align-items-center gap-2 transition-hover p-2 rounded" style={{cursor: 'pointer', margin: '-8px'}}>
                                    <i className="pi pi-image"></i> {isUploading ? 'Uploading...' : 'Add Cover'}
                                </label>
                                <input type="file" id="cover-upload" className="d-none" accept="image/jpeg, image/png, image/webp" onChange={handleCoverUpload} disabled={isUploading} />
                            </div>
                        )}

                        {/* Editor Canvas */}
                        <div className="px-4 px-md-5 pt-5 pb-5">
                            <input 
                                type="text" 
                                className="form-control border-0 fw-bold px-0 shadow-none mb-3 font-heading" 
                                style={{ fontSize: 'var(--admin-fs-page-title)', letterSpacing: '-1.5px', lineHeight: '1.1', color: 'var(--admin-text-main)', background: 'transparent' }}
                                placeholder="Article Title" 
                                value={title}
                                onChange={handleTitleChange}
                            />
                            
                            {/* Meta Bar */}
                            <div className="d-flex align-items-center flex-wrap gap-3 text-muted admin-small-text mb-5 pb-4 border-bottom border-light">
                                <div className="d-flex align-items-center bg-light rounded px-2 py-1">
                                    <span className="me-1 fw-medium">/</span>
                                    <input 
                                        type="text" 
                                        className="form-control form-control-sm border-0 bg-transparent p-0 text-muted admin-small-text fw-medium" 
                                        style={{width: 'auto', minWidth: '150px', boxShadow: 'none'}}
                                        value={slug}
                                        onChange={handleSlugChange}
                                        placeholder="article-slug"
                                    />
                                    {isSlugLocked && (
                                        <button className="admin-btn-icon text-muted py-0 ms-1 hover-text-primary" onClick={() => {
                                            setIsSlugLocked(false)
                                            setSlug(generateSlug(title))
                                        }}>
                                            <i className="pi pi-unlock" title="Unlock slug generation"></i>
                                        </button>
                                    )}
                                </div>
                                <div className="ms-md-auto d-flex gap-4">
                                    <span className="d-flex align-items-center gap-1"><i className="pi pi-file-edit text-muted opacity-75"></i> {contentWords} words</span>
                                    <span className="d-flex align-items-center gap-1"><i className="pi pi-clock text-muted opacity-75"></i> {Math.max(1, Math.ceil(contentWords / 250))} min read</span>
                                </div>
                            </div>

                            {!isInitialLoad.current && (
                                <div className="article-editor-content-wrapper" style={{ minHeight: '500px' }}>
                                    <BlockEditor 
                                        initialContent={content} 
                                        onChange={handleContentChange} 
                                        onUploadFile={handleBlockNoteUpload}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {!isNew && (
                        <div className="admin-gap-card d-flex flex-column mt-4 w-100" style={{ maxWidth: '900px' }}>
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
                        </div>
                    )}
                </div>

                {/* SIDEBAR (Inspector) */}
                <div className="bg-white overflow-auto border-start border-subtle shadow-sm z-1" style={{ width: '380px', minWidth: '380px', borderColor: 'var(--admin-border-subtle) !important' }}>
                    <div className="p-4 d-flex flex-column gap-5">
                        
                        <PublishingReadiness article={{
                            title, slug, status, is_featured: isFeatured, is_pillar: isPillar, content, html_content: htmlContent,
                            category_id: categoryId, cover_image_id: coverImageId, seo_title: seoTitle, seo_description: seoDesc,
                            tags: selectedTags, word_count: contentWords, ...fullArticle
                        }} />

                        <div className="d-flex flex-column gap-3">
                            <h6 className="admin-small-text fw-bold text-uppercase tracking-wider text-muted m-0">Taxonomy</h6>
                            
                            <div>
                                <label className="form-label admin-meta-text fw-medium text-dark mb-2">Category</label>
                                <select className="form-select form-select-sm border border-light shadow-none" value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ borderRadius: 'var(--admin-radius-input)', backgroundColor: 'var(--admin-bg-soft)', color: 'var(--admin-text-main)' }}>
                                    <option value="">Select a category...</option>
                                    {availableCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            
                            <div className="d-flex flex-column gap-2 p-3 rounded" style={{ backgroundColor: 'var(--admin-bg-soft)', border: '1px solid var(--admin-border-light)' }}>
                                <div className="form-check form-switch d-flex justify-content-between align-items-center m-0 p-0">
                                    <label className="form-check-label admin-small-text m-0 text-dark fw-medium" htmlFor="isFeaturedSwitch" style={{ cursor: 'pointer' }}>Featured Article</label>
                                    <input className="form-check-input m-0" type="checkbox" id="isFeaturedSwitch" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ cursor: 'pointer' }} />
                                </div>
                                <hr className="my-2 border-light opacity-50" />
                                <div className="form-check form-switch d-flex justify-content-between align-items-center m-0 p-0">
                                    <label className="form-check-label admin-small-text m-0 text-dark fw-medium" htmlFor="isPillarSwitch" style={{ cursor: 'pointer' }}>Complete Guide (Pillar)</label>
                                    <input className="form-check-input m-0" type="checkbox" id="isPillarSwitch" checked={isPillar} onChange={e => setIsPillar(e.target.checked)} style={{ cursor: 'pointer' }} />
                                </div>
                            </div>

                            <div>
                                <label className="form-label admin-meta-text fw-medium text-dark mb-2">Tags</label>
                                <div className="border border-light rounded p-3 d-flex flex-wrap gap-2" style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: 'var(--admin-bg-soft)' }}>
                                    {availableTags.length === 0 ? <small className="text-muted admin-small-text">No tags available.</small> : availableTags.map(tag => (
                                        <button
                                            key={tag.id}
                                            onClick={() => toggleTag(tag.id)}
                                            className={`badge border-0 transition-hover ${selectedTags.includes(tag.id) ? 'bg-primary text-white shadow-sm' : 'text-dark border border-subtle'}`}
                                            style={{ fontSize: '11px', padding: '6px 10px', borderRadius: '6px', backgroundColor: selectedTags.includes(tag.id) ? 'var(--admin-color-primary)' : 'var(--admin-bg-card)' }}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h6 className="admin-meta-text fw-bold text-uppercase tracking-wider text-muted mb-3">SEO Metadata</h6>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="form-label admin-small-text fw-medium text-dark m-0">SEO Title</label>
                                    <small className={seoTitle.length > 60 ? 'text-danger fw-bold' : 'text-muted admin-small-text'} style={{ fontSize: '10px' }}>{seoTitle.length}/60</small>
                                </div>
                                <input type="text" className="form-control form-control-sm bg-light border-0" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Leave blank to use article title" style={{ borderRadius: '6px' }} />
                            </div>
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="form-label admin-small-text fw-medium text-dark m-0">Meta Description</label>
                                    <small className={seoDesc.length > 160 ? 'text-danger fw-bold' : 'text-muted admin-small-text'} style={{ fontSize: '10px' }}>{seoDesc.length}/160</small>
                                </div>
                                <textarea className="form-control form-control-sm bg-light border-0" rows="4" value={seoDesc} onChange={e => setSeoDesc(e.target.value)} placeholder="Brief summary for search engines..." style={{ borderRadius: '6px' }}></textarea>
                            </div>
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
