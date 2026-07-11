# Marketing Architecture & Conversion Infrastructure

This document outlines the technical architecture of the dynamic marketing and conversion layer for Blackpool Industry.

## 1. Database Schema Overview

The marketing layer uses Supabase and consists of the following core tables:

- **`marketing_campaigns`**: High-level campaigns that group CTAs and Lead Magnets. Supports start/end dates, scheduling, and banners.
- **`marketing_ctas`**: Call-to-action blocks. Supports multiple placements, priority, device targeting, and A/B testing variants.
- **`lead_magnets`**: Downloadable resources exchanged for lead data (emails). Supports versioning.
- **`lead_downloads`**: Records of users downloading lead magnets.
- **`marketing_events`**: High-intent conversion analytics (clicks, signups, downloads).
- **`marketing_settings`**: Global configuration (company details, feature flags, default values).

## 2. Event Lifecycle & Analytics Pipeline

1. **User Interaction**: A user views or clicks a CTA, submits a newsletter, or downloads a lead magnet.
2. **Metadata Enrichment**: The `trackEvent` function attaches metadata: `page`, `referrer`, `device`, `browser`, and `timestamp`.
3. **Local Queuing**: Events intended for Supabase are pushed into the `EventQueue` to minimize database hits.
4. **Batch Processing**: The `EventQueue` flushes every 5 seconds (or on `beforeunload`), sending events to `marketing_events` in bulk.
5. **Analytics Retention**: 
   - *Raw Events*: Retained for 90 days.
   - *Aggregated Metrics*: Kept indefinitely (scheduled jobs summarize historical data).

## 3. CTA & Campaign Lifecycles

### CTA Lifecycle
- **Drafting**: CTAs are created in the admin dashboard (currently using the 'status' boolean, moving to enums in future).
- **Targeting**: Target by placement (`HOME_HERO`, `SIDEBAR`, etc.), category, tag, or device (`mobile`, `desktop`).
- **Conflict Resolution**: If multiple active CTAs target the same placement, the one with the **highest priority** score wins. If priorities are tied, the most recently created CTA wins.
- **Delivery**: Evaluated client-side via `marketingService.js` combined with `useMarketing` hook.
- **UTM Generation**: UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`) are automatically injected into button URLs.

### Campaign Lifecycle
- **Status Flow**: Draft → Scheduled → Running → Paused → Completed / Archived.
- Campaigns group multiple CTAs and Lead Magnets. A global banner can be driven directly by the highest priority active campaign.

## 4. Service Architecture & Fallbacks

- **`marketingService.js`**: The central repository for all Supabase queries relating to marketing. React components and hooks (`useMarketing`, `useCampaigns`) never communicate with Supabase directly.
- **Graceful Degradation**: If Supabase goes offline or network requests fail, the service layer automatically falls back to local configuration files (`ctaConfig.js`, `newsletterConfig.js`, `servicesConfig.js`, `leadMagnetsConfig.js`).

## 5. Feature Flags (Database & Environment)

Marketing features can be toggled without redeploying:
- **Database Flags**: Stored in `marketing_settings` (e.g., `enable_banner`, `enable_newsletter`).
- **Environment Overrides**: Use `VITE_DISABLE_MARKETING=true` for local development, testing, and staging environments to completely bypass Supabase marketing fetches and use local fallbacks.

## 6. Future Enhancements

The architecture is designed to support the following upcoming features:
- **A/B Testing**: The schema supports `variant` (A/B) and `weight` for traffic distribution.
- **Personalization**: `marketingService.js` is structured to accept context like `firstVisit`, `country`, or `referralSource` for hyper-targeted CTAs.
- **Marketing Audit Logs**: A future table to track all CMS changes (User, Action, Old Value, New Value).
- **Preview Mode**: Ability to preview CTAs before publishing.
- **Dashboard Time Filters**: Enhanced date-range querying for the marketing admin dashboard.
