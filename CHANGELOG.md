# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added (Phase 1)
- Initialized Supabase CLI in the project repository for version-controlled schemas.
- Created `20260709000001_user_roles.sql`: User roles enum and profile population trigger (defaults to viewer).
- Created `20260709000002_core_tables.sql`: Normalized schema for Categories, Tags, Media, Articles, and Settings.
- Created `20260709000003_cms_capabilities.sql`: Audit logs and article revisions tables.
- Created `20260709000004_ai_tables.sql`: Placeholder AI tables (prompts, generation_logs, content_clusters, keyword_research).
- Created `20260709000005_amendments.sql`: Added foreign key and composite performance indexes, and SEO metadata fields (`og_*`, `twitter_*`) to articles.
- Implemented robust Row Level Security (RLS) policies for all 15 new tables, securely isolating operations by role (`owner`, `administrator`, `editor`, `author`, `viewer`).
