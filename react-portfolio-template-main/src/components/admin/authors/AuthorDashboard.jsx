import React, { useState, useEffect } from 'react'
import { supabase } from '/src/utils/supabase.js'

export default function AuthorDashboard() {
    const [authors, setAuthors] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAuthors = async () => {
            setLoading(true)
            try {
                // Fetch authors with article counts and stats
                const { data, error } = await supabase
                    .from('authors')
                    .select(`
                        id, name, slug, avatar_url, verified, bio, linkedin, company, job_title,
                        articles:articles!articles_author_id_fkey(id, word_count, estimated_reading_time, view_count, status)
                    `)
                
                if (error) throw error

                // Calculate metrics
                const formatted = data.map(a => {
                    const pubArticles = a.articles.filter(art => art.status === 'published')
                    let views = 0
                    let words = 0
                    
                    pubArticles.forEach(art => {
                        views += (art.view_count || 0)
                        words += (art.word_count || 0)
                    })

                    // Calculate profile completion
                    let score = 0
                    let missing = []
                    if (a.bio) score += 25; else missing.push('Biography');
                    if (a.avatar_url) score += 25; else missing.push('Avatar');
                    if (a.linkedin || a.twitter || a.website || a.github) score += 25; else missing.push('Social Links');
                    if (a.job_title && a.company) score += 25; else missing.push('Role/Company');

                    return { ...a, pubArticlesCount: pubArticles.length, totalViews: views, totalWords: words, completionScore: score, missingFields: missing }
                })
                
                // Sort by views desc
                formatted.sort((a,b) => b.totalViews - a.totalViews)
                setAuthors(formatted)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        
        fetchAuthors()
    }, [])

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"/></div>

    return (
        <div className="p-4">
            <h2 className="fw-bold tracking-tight mb-4">Author Analytics</h2>
            
            <div className="row g-4">
                {authors.map(author => (
                    <div key={author.id} className="col-12 col-xl-6">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body p-4 d-flex gap-4">
                                <div>
                                    <img 
                                        src={author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=random`} 
                                        alt={author.name}
                                        className="rounded-circle"
                                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                    />
                                    {author.verified && <div className="text-center mt-2 text-primary small"><i className="fa-solid fa-circle-check me-1"></i>Verified</div>}
                                </div>
                                <div className="flex-fill">
                                    <h4 className="fw-bold mb-1">{author.name}</h4>
                                    <p className="text-muted small mb-3">{author.pubArticlesCount} Articles Published</p>
                                    
                                    <div className="d-flex gap-4 mb-4 text-center">
                                        <div>
                                            <h5 className="fw-bold mb-0 text-primary">{author.totalViews >= 1000 ? (author.totalViews/1000).toFixed(1)+'k' : author.totalViews}</h5>
                                            <span className="small text-muted text-uppercase tracking-wider">Views</span>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-0 text-success">{author.totalWords >= 1000 ? (author.totalWords/1000).toFixed(1)+'k' : author.totalWords}</h5>
                                            <span className="small text-muted text-uppercase tracking-wider">Words</span>
                                        </div>
                                    </div>
                                    
                                    <div className="border-top pt-3">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="small fw-bold">Profile Completion</span>
                                            <span className={`small fw-bold ${author.completionScore === 100 ? 'text-success' : 'text-warning'}`}>{author.completionScore}%</span>
                                        </div>
                                        <div className="progress" style={{ height: '6px' }}>
                                            <div className={`progress-bar ${author.completionScore === 100 ? 'bg-success' : 'bg-warning'}`} style={{ width: `${author.completionScore}%` }}></div>
                                        </div>
                                        {author.missingFields.length > 0 && (
                                            <div className="small text-muted mt-2">
                                                Missing: {author.missingFields.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
