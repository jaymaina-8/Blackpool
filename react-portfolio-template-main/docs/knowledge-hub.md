# Knowledge Hub & Content Clusters (Phase 9.8)

This document outlines the architecture and workflows for the Blackpool Industry Knowledge Hub.

## Architecture Overview

Instead of treating the CMS as a chronological blog, Version 1 organizes content into hierarchical **Topic Clusters**. This maximizes topical authority, SEO, and user retention.

- **Topic Hubs**: The primary entry points for exploring subjects. These are powered by the `categories` table.
- **Pillar Pages**: Comprehensive guides acting as the anchor for a Topic Cluster. Flagged via `is_pillar` on `articles`.
- **Reading Paths**: Curated journeys for users (e.g., "Start Here" paths) linking specific articles in sequence.
- **Article Relationships**: A directed graph mapping 'next', 'previous', and 'related' articles to power internal linking.

## Database Schema

```sql
-- Extended Articles
articles.is_pillar (boolean)
articles.parent_article_id (uuid)

-- Extended Categories (Topics)
categories.hero_description (text)
categories.icon (text)
categories.seo_title (text)
categories.seo_description (text)

-- New Relational Tables
reading_paths (id, name, slug, description)
reading_path_steps (path_id, article_id, step_order)
article_relationships (source_article_id, target_article_id, relationship_type)
```

## Workflows

### 1. Creating a Topic Hub
When creating a Category via the Admin panel, it automatically becomes a Topic Hub located at `/knowledge/topic/:slug`. By assigning a hero description and icon, the topic page will automatically render as an SEO-optimized landing page.

### 2. Publishing a Pillar Page
Inside the Article Editor, navigate to the Taxonomy panel and toggle **"Complete Guide (Pillar)"**. This article will now be visually highlighted in the Topic Hub and across the site as the definitive guide for that subject.

### 3. Smart Internal Linking
To accelerate cluster building, the Article Editor includes a **Link Assistant**. This tool automatically recommends linking to other articles (especially pillars) within the same Topic Cluster, allowing you to copy-paste markdown links without leaving the editor.

## SEO Strategy
Topic Hubs render `CollectionPage` JSON-LD schema, whereas individual articles render `BlogPosting`.
Breadcrumbs use the `/knowledge` root, establishing a clear site hierarchy: `Home > Insights > [Topic] > [Article]`.

## Future Expansion (Version 2)
- Auto-generate NLP relationships instead of relying on manual link suggestions.
- Render visual D3.js or ReactFlow diagrams on the public Knowledge Hub.
- Automatically ingest Reading Paths as a series of triggered emails for Lead Generation.
