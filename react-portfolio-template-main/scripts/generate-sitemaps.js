import fs from 'fs'
import path from 'path'

/**
 * Generates a static sitemap for the Blackpool Industry marketing website.
 * Blog/article sitemaps will be added when Blackpool OS is integrated.
 */

const SITE_URL = 'https://blackpoolindustry.com'

const staticPages = [
    { loc: '/',                                         priority: '1.0', changefreq: 'weekly'  },
    { loc: '/website-design-nairobi',                   priority: '0.9', changefreq: 'monthly' },
    { loc: '/small-business-websites-nairobi',          priority: '0.9', changefreq: 'monthly' },
    { loc: '/restaurant-website-design-nairobi',        priority: '0.8', changefreq: 'monthly' },
    { loc: '/portfolio/mangrove-hotel',                 priority: '0.7', changefreq: 'monthly' },
    { loc: '/portfolio/metro-bites',                    priority: '0.7', changefreq: 'monthly' },
    { loc: '/portfolio/urban-grill',                    priority: '0.7', changefreq: 'monthly' },
    { loc: '/portfolio/milestone-creative-solutions',   priority: '0.7', changefreq: 'monthly' },
    { loc: '/portfolio/karo-coffee',                    priority: '0.7', changefreq: 'monthly' },
]

function generateSitemap() {
    const today = new Date().toISOString().split('T')[0]

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

    for (const page of staticPages) {
        sitemap += `
    <url>
        <loc>${SITE_URL}${page.loc}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`
    }

    sitemap += `\n</urlset>\n`

    const publicDir = path.resolve(process.cwd(), 'public')
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir)
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap)
    console.log(`sitemap.xml generated with ${staticPages.length} marketing pages.`)
}

generateSitemap()
