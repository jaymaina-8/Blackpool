import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables for the build context
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SITE_URL = 'https://blackpoolindustry.com'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase credentials. Sitemap generation skipped.')
    process.exit(0)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function generate() {
    try {
        console.log('Fetching published articles for sitemap...')
        const { data: articles, error } = await supabase
            .from('articles')
            .select('slug, published_at, updated_at, title, excerpt, author_id')
            .eq('status', 'published')
            .is('deleted_at', null)
            .order('published_at', { ascending: false })

        if (error) throw error

        console.log(`Found ${articles.length} articles. Generating sitemap.xml...`)

        // Generate Article Sitemap
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${SITE_URL}/blog</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>`

        for (const article of articles) {
            const lastMod = new Date(article.updated_at || article.published_at).toISOString()
            sitemap += `
    <url>
        <loc>${SITE_URL}/blog/${article.slug}</loc>
        <lastmod>${lastMod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`
        }
        sitemap += `\n</urlset>`

        const publicDir = path.resolve(process.cwd(), 'public')
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir)
        }
        fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap)
        console.log('sitemap.xml generated successfully.')

        // Generate Global RSS
        console.log('Generating rss.xml...')
        const buildDate = new Date().toUTCString()
        let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
    <title>Blackpool Insights</title>
    <link>${SITE_URL}/blog</link>
    <description>Thoughts, learnings, and announcements from Blackpool Industry.</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>`

        for (const article of articles) {
            const pubDate = new Date(article.published_at).toUTCString()
            rss += `
    <item>
        <title><![CDATA[${article.title}]]></title>
        <link>${SITE_URL}/blog/${article.slug}</link>
        <guid>${SITE_URL}/blog/${article.slug}</guid>
        <pubDate>${pubDate}</pubDate>
        <description><![CDATA[${article.excerpt || ''}]]></description>
    </item>`
        }
        rss += `\n</channel>\n</rss>`

        fs.writeFileSync(path.join(publicDir, 'rss.xml'), rss)
        console.log('rss.xml generated successfully.')

        // Fetch Authors for Author Sitemap
        console.log('Fetching authors for author sitemap...')
        const { data: authors, error: authorsError } = await supabase
            .from('authors')
            .select('id, slug, updated_at')

        if (authorsError) throw authorsError

        let authorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

        const authorDir = path.join(publicDir, 'blog', 'author')
        if (!fs.existsSync(authorDir)) {
            fs.mkdirSync(authorDir, { recursive: true })
        }

        for (const author of authors) {
            const lastMod = new Date(author.updated_at).toISOString()
            authorSitemap += `
    <url>
        <loc>${SITE_URL}/blog/author/${author.slug}</loc>
        <lastmod>${lastMod}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>`

            // Generate Author-specific RSS Feed
            const authorArticles = articles.filter(a => a.author_id === author.id)
            if (authorArticles.length > 0) {
                let authRss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
    <title>Articles by ${author.slug}</title>
    <link>${SITE_URL}/blog/author/${author.slug}</link>
    <description>Latest articles from ${author.slug}.</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>`

                for (const article of authorArticles) {
                    const pubDate = new Date(article.published_at).toUTCString()
                    authRss += `
    <item>
        <title><![CDATA[${article.title}]]></title>
        <link>${SITE_URL}/blog/${article.slug}</link>
        <guid>${SITE_URL}/blog/${article.slug}</guid>
        <pubDate>${pubDate}</pubDate>
        <description><![CDATA[${article.excerpt || ''}]]></description>
    </item>`
                }
                authRss += `\n</channel>\n</rss>`
                
                const specificAuthorDir = path.join(authorDir, author.slug)
                if (!fs.existsSync(specificAuthorDir)) {
                    fs.mkdirSync(specificAuthorDir, { recursive: true })
                }
                fs.writeFileSync(path.join(specificAuthorDir, 'rss.xml'), authRss)
            }
        }
        authorSitemap += `\n</urlset>`
        fs.writeFileSync(path.join(publicDir, 'author-sitemap.xml'), authorSitemap)
        console.log('author-sitemap.xml and author rss feeds generated successfully.')

    } catch (err) {
        console.error('Error generating sitemaps:', err)
        process.exit(1)
    }
}

generate()
