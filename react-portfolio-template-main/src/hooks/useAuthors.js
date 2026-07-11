import { useState, useCallback } from 'react'
import { supabase } from '/src/utils/supabase.js'

export function useAuthors() {
    const [author, setAuthor] = useState(null)
    const [articles, setArticles] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchAuthorBySlug = useCallback(async (slug, page = 1, limit = 12) => {
        setLoading(true)
        setError(null)
        try {
            // 1. Fetch Author Profile from 'authors' table
            const { data: profile, error: profileError } = await supabase
                .from('authors')
                .select(`
                    id, 
                    user_id,
                    name, 
                    avatar_url, 
                    slug, 
                    bio, 
                    job_title, 
                    company, 
                    website, 
                    linkedin, 
                    github, 
                    twitter, 
                    seo_title, 
                    seo_description,
                    verified,
                    verified_at,
                    author_badges ( badges (*) ),
                    author_expertise ( expertise (*) )
                `)
                .eq('slug', slug)
                .single()

            if (profileError) throw profileError

            // Flatten badges and expertise
            const formattedAuthor = {
                ...profile,
                full_name: profile.name, // Compat
                badges: profile.author_badges?.map(pb => pb.badges) || [],
                expertise: profile.author_expertise?.map(pe => pe.expertise) || []
            }
            
            setAuthor(formattedAuthor)

            // 2. Fetch Author's Published Articles with Pagination
            const from = (page - 1) * limit
            const to = from + limit - 1

            const { data: authorArticles, count, error: articlesError } = await supabase
                .from('articles')
                .select(`
                    id,
                    title,
                    slug,
                    excerpt,
                    published_at,
                    estimated_reading_time,
                    word_count,
                    view_count,
                    categories (name, slug),
                    media (storage_path, alt_text)
                `, { count: 'exact' })
                .eq('author_id', profile.id)
                .eq('status', 'published')
                .order('published_at', { ascending: false })
                .range(from, to)

            if (articlesError) throw articlesError

            // Re-map media for cover_image to keep component compat
            const formattedArticles = (authorArticles || []).map(a => {
                let coverUrl = null
                if (a.media) {
                    const { data: urlData } = supabase.storage.from('media').getPublicUrl(a.media.storage_path)
                    coverUrl = urlData.publicUrl
                }
                return {
                    ...a,
                    category: a.categories,
                    cover_image: a.media,
                    coverUrl
                }
            })

            setArticles(formattedArticles)

            // 3. Calculate Stats (Overall, so we need a separate query for totals if pagination limits the articles array)
            const { data: allStatsArticles } = await supabase
                .from('articles')
                .select('word_count, estimated_reading_time, view_count, category_id')
                .eq('author_id', profile.id)
                .eq('status', 'published')

            let totalWords = 0
            let totalReadTime = 0
            let totalViews = 0
            const categoriesSet = new Set()

            if (allStatsArticles) {
                allStatsArticles.forEach(a => {
                    totalWords += (a.word_count || 0)
                    totalReadTime += (a.estimated_reading_time || Math.ceil((a.word_count || 0) / 200))
                    totalViews += (a.view_count || 0)
                    if (a.category_id) categoriesSet.add(a.category_id)
                })
            }

            setStats({
                articlesPublished: count,
                wordsWritten: totalWords,
                readingMinutes: totalReadTime,
                categoriesWritten: categoriesSet.size,
                totalViews: totalViews
            })

            return { totalPages: Math.ceil(count / limit) }

        } catch (err) {
            console.error("Error fetching author:", err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        author,
        articles,
        stats,
        loading,
        error,
        fetchAuthorBySlug
    }
}
