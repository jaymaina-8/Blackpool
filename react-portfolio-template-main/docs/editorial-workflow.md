# Editorial Workflow (Version 1 — Solo Publisher)

This document outlines the simplified editorial workflow engine for the Blackpool CMS, describing the lifecycle of an article from draft to publication for a single publisher.

## Workflow States (`article_status`)

The Version 1 workflow uses a streamlined subset of states:

1. **`draft`**: The initial state. The article is invisible to the public.
2. **`scheduled`**: The article is ready and assigned a future `published_at` date. A GitHub Action automatically publishes it when the time arrives.
3. **`published`**: The article is live on the site.
4. **`archived`**: The article has been unpublished and removed from public view.

*Note: The database contains additional states (`in_review`, `changes_requested`, `approved`) which are reserved for a future multi-author enterprise release.*

## Core Features

### 1. Revision History (`article_versions`)
Every time an article is saved, a new revision is stored in the `article_versions` table. This provides a complete audit trail of content changes. You can view the history, compare visual differences between versions, and restore previous versions if needed.

### 2. Publishing Readiness (`PublishingReadiness`)
Before an article can be published, the CMS evaluates a pre-flight checklist:
- Title length
- Slug validity
- Featured Image presence
- Category assignment
- SEO description and title
- Minimum word count

This ensures all published content meets a baseline standard of quality.

### 3. Scheduled Publishing
Scheduled publishing is handled by a cron-triggered GitHub Action (`.github/workflows/scheduled-publishing.yml`) running every 15 minutes. It executes `scripts/publish-scheduled.js` to transition `scheduled` articles to `published` if their `published_at` timestamp has passed, and then triggers a sitemap and RSS rebuild.

### 4. Solo Publisher Dashboard
The Editorial Dashboard provides a high-level operational overview including:
- **Content:** Aggregated counts of drafts, scheduled, published, and archived articles.
- **Publishing:** Quick views of the next scheduled article, the last published article, and the health status of the GitHub Actions scheduler.
- **Performance & SEO:** Aggregated quality scores and engagement metrics (e.g., Views, CTA Click Rates).

## Future Enterprise Architecture

**Version 1 targets a single publisher. Multi-author editorial workflows remain architecturally supported but are intentionally disabled until future business requirements justify their activation.**

The underlying database architecture still supports an enterprise editorial workflow. The following features are currently hidden but available for future use:
- **`editorial_comments`**: Table for reviewers to leave block-level feedback on drafts.
- **`article_locks`**: Heartbeat mechanism to prevent concurrent editing collisions between multiple authors.
- **`approval_steps`**: Advanced routing for assigning reviewers to specific content pieces.
- **Notification Inbox**: A system to manage review requests and editorial discussions.
