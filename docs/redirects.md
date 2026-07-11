# URL Redirect Strategy & Reserved Slugs

## 1. Reserved System Slugs
To prevent routing collisions between the CMS frontend, backend APIs, and the blog content itself, the following slugs are permanently reserved. They cannot be assigned to any article, category, or tag:

- `admin`
- `api`
- `login`
- `blog`
- `settings`
- `media`
- `categories`
- `tags`

The `useArticles.js` hook natively blocks the assignment of these slugs during both creation and update operations.

## 2. Dynamic URL Generation Strategy
In Project Atlas, canonical URLs are never stored redundantly as hardcoded strings (e.g., `https://domain.com/blog/article-slug`). Instead, the CMS relies entirely on dynamic generation at runtime.

The canonical URL is composed using the environment variable `VITE_PUBLIC_URL` and the database `slug` column.
For example, an article with the slug `building-project-atlas` will be securely mapped to:
`${process.env.VITE_PUBLIC_URL}/blog/building-project-atlas`

## 3. Redirect Architecture for Edited Slugs (Version 2.0 Concept)
In Version 1, if an author changes the slug of an already *published* article, the old URL will return a `404 Not Found`.

In Version 2.0, to preserve SEO equity and prevent broken links across the internet, the system will implement an automated 301 Redirect Architecture:

1. **`redirects` Table:** A new `public.redirects` table will be introduced containing `source_path`, `destination_path`, and `type` (301 or 302).
2. **Database Trigger:** A PostgreSQL trigger will monitor the `articles.slug` column.
3. **Capture Logic:** When an `UPDATE` on `articles` changes the `slug` AND the article's status is `published`, the trigger will automatically insert a row into the `redirects` table mapping the old slug to the new slug.
4. **Edge Middleware Validation:** The Vercel/Next.js Edge Middleware will quickly check incoming 404s against the `redirects` table and issue a fast `301 Permanent Redirect` to the new slug, seamlessly transferring SEO link juice.
