# Marketing CTAs and Lead Magnets

This document explains the Dynamic Marketing layer introduced in Phase 9.4.

## Dynamic CTAs
Instead of hardcoding CTAs in React components, CTAs are now managed entirely through the Supabase database via the `marketing_ctas` table.

- **Placement**: CTAs can be targeted to specific areas (`homepage`, `blog`, `sidebar`, `footer`, `any`).
- **Priority**: Higher priority CTAs will be shown first.
- **Scheduling**: CTAs can have `start_date` and `end_date` bounds.
- **Component**: `<DynamicCTA placement="blog" />` will automatically fetch and display the most relevant active CTA.

## Lead Magnets
Lead magnets are downloadable resources gated behind an email capture form (optional depending on `email_required`).

- **Table**: `lead_magnets`
- **Capture Table**: `lead_downloads`
- **UI**: Displayed using `<LeadMagnetCard magnet={magnet} />`.

All interactions are tracked through the new unified analytics layer.
