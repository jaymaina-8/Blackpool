# Media Management Architecture

## Overview
The Scalable Media Infrastructure in Project Atlas manages all binary assets (images, vectors) uploaded via the CMS. The architecture is a hybrid "dual-write" system: raw binary files are stored in Supabase Storage (`storage.objects`), while rich metadata and hierarchical references are maintained in the PostgreSQL database (`public.media`).

## 1. Storage Conventions & Hierarchy
Uploaded files are no longer stored in a flat namespace. We utilize a `YYYY/MM/` hierarchical folder structure inside the `media` storage bucket (e.g., `2026/07/17395010-xyz123.jpg`).
This partitioning prevents directory listing timeouts on large buckets and creates a predictable organizational structure mimicking traditional CMSs like WordPress.

**Canonical Reference:**
The `public.media` table stores the `storage_path` (e.g., `2026/07/xyz.jpg`) rather than the absolute public URL. Absolute URLs are generated dynamically at runtime (`supabase.storage.from('media').getPublicUrl()`), allowing the backend domain or storage provider to change without breaking thousands of historical database records.

## 2. Upload Pipeline & Validation
1. **Client-side Interception:** File is intercepted by `MediaUploader.jsx`.
2. **Validation:** Checks enforce a strict `< 5MB` size limit and restrict uploads exclusively to: `image/jpeg, image/png, image/webp, image/gif, image/svg+xml`.
3. **Metadata Extraction:** The file is temporarily mounted into a browser memory `HTMLImageElement` to extract the intrinsic `width` and `height`.
4. **Storage Upload:** The binary is securely streamed to the `media` bucket.
5. **Database Transaction:** Metadata (`storage_path`, `size_bytes`, `width`, `height`, `alt_text`, `caption`, `description`, `uploaded_by`) is logged in `public.media`.

*If the database transaction fails, the hook attempts to eagerly delete the orphaned object from the storage bucket to maintain 1:1 synchronization.*

## 3. Metadata Model
The `public.media` table acts as the source of truth for assets:
- **Alt Text:** Required for accessibility and SEO.
- **Caption:** Optional display text intended to render below images in the article context.
- **Description:** Optional internal notes for editors.
- **Intrinsic Dimensions (`width`/`height`):** Storing these prevents Cumulative Layout Shift (CLS) on the public blog because we can pre-reserve the layout space before the image downloads.

## 4. Deletion Workflow (Soft Deletes)
In alignment with the global CMS strategy, media deletion is a two-step process:
1. `public.media` is updated by setting `deleted_at = NOW()`. This immediately removes the image from the Media Library and frontend APIs (Soft Delete).
2. The raw object in `storage.objects` is hard-deleted using `supabase.storage.remove()`. 
*Note: Because `storage.objects` is hard-deleted to save storage costs, "Restoring" a soft-deleted media row from the database trash bin is generally not possible without re-uploading the original file.*

## 5. Future Media Optimization Enhancements (Version 2.0)
While Version 1 focuses on a robust foundation, the architecture natively supports the following future capabilities:

1. **Duplicate Detection (Content Hashing):** Before uploading, the frontend could calculate a fast SHA-256 hash of the file. If that hash already exists in `public.media`, the system can instantly attach the existing record instead of uploading a duplicate binary.
2. **AI-Ready Metadata:** 
   - **OCR (Optical Character Recognition):** Supabase Edge Functions could trigger on upload to extract text from images and append it to the `description` field, making images searchable by text they contain.
   - **Auto-Tagging:** Passing uploaded images through a lightweight vision model to auto-generate `alt_text` and categorized tags.
3. **BlurHash Generation:** Generate tiny, Base64 BlurHash strings synchronously during upload and store them in the `media` table, allowing instant fuzzy placeholders while high-res images load.
4. **Upload Queues:** Implement a global upload context to queue bulk drag-and-drop operations rather than processing them synchronously in the current component tree.
