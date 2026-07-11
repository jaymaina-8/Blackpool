# Conversion Analytics

The central analytics system lives in `src/utils/analytics/`.

## Architecture
- `constants.js`: Defines all standardized event names (e.g. `CTA_CLICKED`, `LEAD_MAGNET_DOWNLOADED`).
- `providers.js`: Houses adapters for GA4, PostHog, Plausible, and Supabase.
- `trackEvent.js`: The central API `track(eventName, properties)`. It includes debounce logic to prevent spam.

## Supabase Dashboard Integration
To support the internal `MarketingDashboard.jsx` without sending thousands of raw `page_view` events to our database, the `supabase` provider in `providers.js` selectively filters events. 

Only critical conversion events (CTA clicks, newsletter signups, magnet downloads) are saved to the `marketing_events` table. This provides a fast, lightweight internal dashboard while leaving heavy traffic analysis to external tools like GA4 or PostHog.
