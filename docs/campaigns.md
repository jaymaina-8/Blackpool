# Marketing Campaigns

The Campaign system allows you to bundle marketing efforts under a single scheduled event.

## Features
- **Scheduling**: Campaigns are only active between their `start_date` and `end_date`.
- **Top Banner**: If `banner_enabled` is true, the `MarketingBanner` component will automatically display a dismissible banner at the top of the site.
- **Relational Integrity**: CTAs and Lead Magnets can optionally be linked to a `campaign_id`. This allows you to track conversions associated with a specific campaign.

## Data Structure
The `marketing_campaigns` table holds:
- `name`: Internal name (e.g., 'Summer Sale 2026').
- `status`: 'draft', 'active', 'ended'.
- `start_date` / `end_date`: Activation bounds.
- `banner_enabled`: Boolean to show the global site banner.
- `banner_text`, `banner_url`, `banner_color`: Configs for the banner.
