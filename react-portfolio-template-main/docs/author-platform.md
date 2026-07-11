# Author Platform & Trust Layer

This document outlines the architecture for managing authors, multi-authorship, expertise, and trust indicators across the Blackpool Industry publication.

## 1. Database Architecture

### Profiles
The `public.profiles` table has been extended to act as the primary Author Profile. By extending `auth.users` directly, we maintain a 1:1 relationship between a system user and an author.

**Key New Fields:**
- `slug`: For public routing (`/blog/author/:slug`).
- `bio`, `job_title`, `company`: Professional metadata.
- `linkedin`, `twitter`, `github`, `website`: Social links.
- `seo_title`, `seo_description`: Meta tags for their specific profile page.
- `featured`: Boolean to highlight specific authors across the site.

### Multi-Author Support
The `public.article_authors` join table supports complex authorship:
- **`primary`**: The main author (also syncs with `articles.author_id` for backward compatibility).
- **`co-author`**: Secondary authors.
- **`reviewer`**: Technical or clinical reviewers.
- **`editor`**: Editorial staff.

### Trust Indicators
The `public.articles` table has been enhanced with trust metrics:
- `reviewed_by`: References a profile for technical/clinical review.
- `fact_checked`: Boolean indicating editorial verification.
- `sources`: JSONB array of external citations.
- `estimated_reading_time` & `word_count`: Saved to the database to prevent expensive client-side recalculations on large articles.

### Badges & Expertise
- **`badges`**: Visual indicators (e.g., "Founder", "SEO Expert"). Assigned via `profile_badges`.
- **`expertise`**: Topical authority categories. Assigned via `profile_expertise`. Used to build "Expertise Hubs" in the future.

## 2. Routing & Views

- **`/blog/author/:slug`**: The public-facing profile page. 
  - Displays: Avatar, bio, badges, social links, and an aggregated feed of their published articles.
  - Generates a `Person` JSON-LD schema automatically.

- **Editorial Scaffolding**: 
  - Future routes like `/editorial-policy` and `/about/authors` are planned to further establish E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness).

## 3. Analytics
The `trackEvent` system now monitors author engagement:
- `AUTHOR_PROFILE_VIEWED`: When a user visits the author's dedicated page.
- `AUTHOR_FOLLOW_CLICKED`: Intended for future community features.
- `SOCIAL_LINK_CLICKED`: When a user clicks an author's Twitter, LinkedIn, etc.
- `AUTHOR_ARTICLE_CLICKED`: When an article is accessed from the author's profile feed.

## 4. SEO & Schema
- **Person Schema**: Generated on `/blog/author/:slug`.
- **Article Schema**: The `BlogPosting` schema now includes `author` and optionally `reviewedBy` objects with links (`sameAs`) back to their author profile.

## 5. Future Roadmap & Recommendations
- **Decouple Profiles from Authors**: Transition from extending `public.profiles` to a dedicated `public.authors` table. This allows guest writers and ensures internal staff (Admins/Developers) don't accidentally appear as public authors.
- **Author Verification**: Introduce `verified`, `verified_at`, and `verified_by` columns to display a "✓ Verified Author" badge.
- **Expertise Scores**: Display expertise levels (e.g., SEO ★★★★★, 42 Articles) so readers instantly understand qualifications.
- **Author Discoverability**: 
  - Generate `/author-sitemap.xml` for independent Google crawling.
  - Generate `/blog/author/:slug/rss.xml` to allow subscribing to specific authors.
- **Author Archive Pagination**: Support `?page=X` on author pages to handle hundreds of articles efficiently.
- **Expanded Reading Statistics**: Expand Author stats to include Views, Newsletter Signups, Downloads, and Conversion Rates.
- **Advanced Reviewer System**: Expand roles to explicitly trace Author -> Reviewer -> Fact Checker -> Editor.
- **Citation Support**: Build a References section that automatically numbers and links citations (e.g. [1] Google).
- **Editorial Timeline**: Display the full lifecycle: Published Date -> Updated Date -> Reviewed Date.
- **Author Analytics Dashboard**: Create an admin view showing performance metrics per author (Views, Conversions, Top Keywords).
- **Profile Completion Score**: Add an admin widget showing missing fields (e.g., 92% Complete, Missing Biography) to encourage data quality.
