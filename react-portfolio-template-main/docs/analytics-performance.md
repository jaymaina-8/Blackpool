# Analytics & Performance Engine

The Analytics & Performance Engine (Phase 9.7) transforms the publishing dashboard from a standard CMS overview into a data-driven business intelligence tool.

## Philosophy

Instead of relying solely on Google Analytics, we capture **first-party analytics** directly into our Supabase database. This guarantees 100% data ownership, bypasses ad-blockers for critical business events, and allows us to join marketing events (newsletter signups) directly with content metadata.

## Core Capabilities

### 1. Traffic & Behavior (`analytics_events` table)
Tracks:
- Page views
- Reading funnels (Scroll depth: 25%, 50%, 75%, 100%)
- Referrer sources
- Internal and external link clicks

Session tracking is inherently privacy-focused: it relies on a `sessionStorage` ID, meaning a user returning a day later is counted as a new unique visit. This avoids strict GDPR cookie banners for generic tracking while maintaining accuracy for session-level funnels.

### 2. Core Web Vitals (`core_web_vitals` table)
Uses the official Google `web-vitals` library to capture field data for:
- **LCP (Largest Contentful Paint)**: Loading performance
- **FCP (First Contentful Paint)**: Initial render speed
- **CLS (Cumulative Layout Shift)**: Visual stability
- **INP (Interaction to Next Paint)**: Responsiveness

### 3. Search Analytics (`search_analytics` and `search_opportunities`)
Captures internal search queries to help editors identify "content gaps" (what users search for but cannot find). Queries that return 0 results are automatically logged in `search_opportunities` to inform future content strategy.

### 4. Dashboards & Visualization
Uses `recharts` to render performance and traffic trends in a visually appealing and responsive manner.

- **Master Overview**: Provides a high-level summary of traffic, revenue, live visitors, and AI-generated insights.
- **Audience & Engagement**: Displays reading funnel drop-offs with exact reader counts, top performing articles by views, and content decay warnings.
- **Conversion & Revenue**: Shows total revenue generated, category leaderboards by conversion rate, and a CTA heatmap to optimize conversion placements.
- **Article Analytics**: Accessed directly from the `ArticleEditor.jsx`, allowing editors to see the reading funnel and conversion metrics specific to that exact article.

### 5. Content Decay & Intelligence
- **Insights**: The dashboard automatically highlights significant trends (e.g., "SEO articles convert 41% better").
- **Decay Warnings**: Flags articles that have lost significant traffic month-over-month.
- **Recommendations**: Proposes the exact next article to write based on unfulfilled search demand (e.g., "Write: Why Every Restaurant Needs a Website").

## Future Enterprise Considerations

As the platform scales, the tracking tables will grow massive. For enterprise deployments:
1. **TimescaleDB/ClickHouse**: Move analytics events off the main operational PostgreSQL database and into an OLAP database.
2. **Data Retention**: The `daily_metrics` table is designed to store historical snapshots. Use `pg_cron` to summarize events nightly and delete raw data older than 90 days.
3. **A/B Testing**: Connect the analytics engine to feature flags to measure variant success rates.
