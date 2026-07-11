# Lead Generation Architecture

The Blackpool Industry blog acts as the primary inbound marketing engine. Every article dynamically guides readers from content consumption to becoming potential leads.

## 1. Component Strategy

The Lead Generation Layer is injected at the bottom of `ArticlePage.jsx` using `React.lazy()` and `<Suspense>`. This ensures the primary reading experience and Core Web Vitals (LCP, CLS) are never impacted by lead generation components loading.

### Components
- **ArticleCTA:** Context-aware call-to-action.
- **AuthorCard:** Reinforces expertise and authority.
- **RelatedServices:** Cross-sells core services.
- **NewsletterSignup:** Collects emails into the `newsletter_subscribers` Supabase table.
- **ReadingCompletionCTA:** Appears dynamically using an `IntersectionObserver` when the user reaches 85% scroll depth.

## 2. Dynamic CTA Rules (ctaConfig.js)

`ArticleCTA` uses `getCtaForCategory()` to read from `src/config/ctaConfig.js`. 
It performs a lightweight `includes` match on the article's category name. If a match is found (e.g. category "SEO"), the user is presented with a specialized CTA ("Need Better Google Rankings?"). If no match is found, it falls back to a default CTA.

## 3. Analytics (analytics.js)

All events are routed through a centralized utility: `src/utils/analytics.js`.
This abstracts `window.gtag` and ensures that if we migrate to PostHog, Mixpanel, or add a CRM, we only edit one file.

### Tracked Events (`LEAD_EVENTS`)
- `cta_viewed`: Fired when `ArticleCTA` enters the viewport.
- `cta_clicked`: Captures primary/secondary clicks.
- `newsletter_submitted`: Fired upon successful Supabase insert.
- `related_article_clicked`: Tracks internal recommendation success.
- `service_clicked`: Tracks cross-sell clicks.
- `author_card_interaction`: Tracks social icon clicks.
- `reading_completed`: Fired when the `ReadingCompletionCTA` animates into view.

## 4. Newsletter Flow

The `NewsletterSignup` component writes directly to the `newsletter_subscribers` table in Supabase.
- **Security:** RLS allows anonymous inserts but restricts reads to authenticated admins.
- **Validation:** Handles Postgres unique constraints (`23505`) to politely inform users if they are already subscribed.

## 5. Future Roadmap
- **Marketing Automation:** Connect the `newsletter_subscribers` table to Resend or Mailchimp via Supabase Webhooks.
- **AI Recommendations:** Upgrade the `fetchRelatedArticles` logic to use vector embeddings for semantic "Related Articles".
- **CRM Integration:** Forward `cta_clicked` events to a CRM (e.g. HubSpot) when users fill out the contact form.
