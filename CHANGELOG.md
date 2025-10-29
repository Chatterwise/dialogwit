# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [Unreleased]

- Fix theme handling in the src/components/ChatTemplates/FloatingChatButton.tsx component. **[CHAT-46]**
- Remove Iubenda references. Added UK compliant consent banner, generated internal pages for cookies, term of service, and privacy policies, reworked links in footer. Also, posthog analytics are now enabled through the src/components/AnalyticsProvider.tsx based on consent response. **[CHAT-45]**
- InstallationWizard.tsx updated to accept markdown, point at the new supabase function to handle bot message, use the new welcome_message column when not null or default to current configuration using bot name and description. **[CHAT-44]**
- CSP fixes, issues identified in live site, did not show up in local testing. Updated netlify.toml. **[CHAT-43]**
- Fixing legacy redirects from supabase  **[NO-TICKET]**
- Fix PublicChat language deployment errors. **[NO-TICKET]**

### 1.1.5 (2025-09-02)

- BillingDashboard and SubscriptionStatus component translation fixes. **[CHAT-41]**
- Follow-up fix to netlify.toml, previous deployment introduced a bug.
- Updated Content-Security-Policy in netlify.toml file. **[CHAT-39]**
- Fixed plans section in the landing page to ensure it captures i18n configuration. **[CHAT-40]**
- All plans translations are now in place and arranged in block for easy access. **[CHAT-40]**
- PricingPlans component now users language configuration and is consistent with values shown in the landing page. **[CHAT-40]**
- Added missing translations **[CHAT-40]**
- Fixing landing page misformed text **[NO-TICKET]**

### 1.1.3 (2025-08-29)

### Fixed

- i18n: Persist language preference; auto-detect via browser/IP with consent modal (localStorage + cookie) (lang)
- Templates: Add premium Glass Dock and Messenger templates with quick replies, reactions, day separators, scroll-to-bottom pill (templates)
- Builder: Simplify chatbot creation — remove role templates; add General Info fields (name, description, welcome, fallback, placeholder) (builder)
- Auth: Replace left panel graphic with animated on-brand mini chat preview (auth)
- SEO: Add html lang via Helmet and dynamic hreflang/canonical links (seo)
- Reliability: Add top-level ErrorBoundary (core)
- Bug Fixes
- i18n: Correct “Español” label and make ChatPreview translation-safe/reactive (i18n)
- Routing: Fix locale-aware links for Billing (analytics/pricing) and Integrations (templates/api/wizard) (routing)
- UI: Improve dark-mode readability for bot bubbles in premium templates (ui)
- Meta: Fix corrupted meta description text (seo)
- Geo: Expand Spanish-speaking country mapping for better IP-based suggestions (geo)
- Performance Improvements
- Code splitting: Convert major routes to React.lazy with Suspense fallback; add LoadingScreen skeleton (perf)
- Security
- CSP/Headers: Add strict security headers (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) and hardened CSP; remove inline GA and externalize Iubenda  config (security)
- Build System
- GA: Initialize via code (VITE_GA_MEASUREMENT_ID) instead of inline scripts (build)
- Supabase: Fail fast when VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are missing; remove defaults (build)
- Stripe: Move billing portal URL to env (VITE_STRIPE_BILLING_PORTAL_URL) (build)
- Sitemap: Generate language-aware sitemap during build (prebuild script) (build)

### Added

- Add GitHub Actions workflow (install, lint, typecheck, build) using VITE_* secrets (ci)

### Fixed

- chatbot delition, chatbot status to the metadata **[NO-TICKET]**

### 1.1.2 (2025-08-28)

### Fixed

- chatbot delition, chatbot status to the metadata **[CHAT-30]**
- Adding translations to the site **[CHAT-37]**

### 1.1.1 (2025-08-27)

### Changed

- Updated the edgefunctions to use openAI vectors and agents **[CHAT-36]**
- Supabase welcome_message Chatbot table field now defaults to null. **[CHAT-33]**
- Removed chatbot on create default from ChatbotBuilder.tsx. **[CHAT-33]**
- Fixed odd scrolling in PublicChat.tsx, added a logic for chatbot to default to use welcome_message property or default Hello! I'm ${chatbot.name}. ${chatbot.description} How can I help you today? **[CHAT-33]**

### 1.1.0 (2025-08-21)

### Fixed

- Reposition add knowledge button in KnowledgeBase.tsx. **[CHAT-7]**
- Added ScrollToTop to the ../docs/getting-started/introduction, ../docs/getting-started/first-chatbot, ../docs/getting-started/knowledge-base, /training-chatbot, All /docs/integrations pages, all /docs/advanced-features pages **[CHAT-25]**
- Removed non drafted entries from tutorials page. **[CHAT-25]**
- Profile Picture upload issue **[CHAT-20]**
- Chatbot status is not updating properly **[CHAT-26]**
- Added a markdown parcer of the main chatbot of the app **[CHAT-24]**
- Settings on header not auto closing when focus is lost **[CHAT-28]**
- Eliminated all `any` casts; strict typing across upload, processing, and list rendering. **[CHAT-35]**
- Prevents premature “Processed” state; failures are shown immediately without manual refresh. **[CHAT-35]**

### Added

- Profile picture on the header **[CHAT-27]**
- RAG settings per chatbot Server now reads `rag_settings` from DB for each `chatbot_id` and only falls back to defaults when a field is missing. Supports: `enable_citations`, `max_retrieved_chunks`, `similarity_threshold`, `enable_streaming`, `model`, `temperature`, `max_tokens`, `chunk_char_limit`, `min_word_count`, `stopwords`. **[CHAT-35]**
- Batch processing UI in `BotKnowledgeContent`:
  - “Process Selected” button with sequential submission.
  - Global batch progress bar and counts (submitted/failed-to-submit).
  - Per-item progress with optimistic animation while waiting for backend. **[CHAT-35]**
- Live status updates:
  - Subscribes to Supabase Realtime (`postgres_changes`) on `knowledge_base` rows.
  - Automatic **polling fallback** (2s) when Realtime is unavailable. **[CHAT-35]**
- Multi-file & folder uploads in `FileUpload` (drag & drop folders via `webkitGetAsEntry`). **[CHAT-35]**
- Shared types: `src/types/knowledge.ts` with `ProcessedFile`, `KnowledgeItem`, `UploadStatus`, etc. **[CHAT-35]**

### Changed

- **Do not mark items as completed on submit**: items remain `processing` until DB marks `processed=true` or `status='error'`.
- **FileUpload**:
  - Strong TS types (no `any`), safe ID generation, per-selection limits, size/type validation, dedupe by `name+size`.
  - Returns **only the newly chosen batch** to parent (`onFilesSelected`).
- **BotKnowledgeContent**:
  - No `any`; uses `KnowledgeItemWithRuntime` (optional `progress`, `error_message`) for UI state.
  - Helper `toBase()` converts `content: string | null` → `string | undefined` when calling external handlers.
  - Clear badges for `Pending` / `Processing` / `Processed`; inline error text on failures.
- **KnowledgeEditorModal**:
  - Prepared for multi-file flow; saves uploaded docs into storage + `knowledge_base` with `status='pending'`.
- **ChatPreview**:
  - Initial bot message now uses the chatbot settings (welcome message/placeholder) when available.

### Removed

- **“Text content” authoring path** from the add-knowledge flow (document upload only).

### 1.0.3 (2025-08-05)

### Changed

- bot creation and trainning flow **[NO-TICKET]**

### 1.0.2 (2025-08-05)

- Removed security tab from settings **[CHAT-21]**
- Enable the chatterwise bot on the landing page and dashboard; demo bot on the landing also trainned and is working **[CHAT-9]**

### 1.0.1 (2025-08-03)

### Fixed

- Visual bug Integrations/ Select chatbot **[CHAT-8]**
- Documentation tab broken links **[CHAT-3]**
- Upgrade plan now takes users to the pricing page where they can upgrade properly **[CHAT-18]**
- On Sign-up behaviour **[CHAT-13]**
- Landing page communication improvements **[CHAT-19]**
- Renaming subscription btn and adding modal for cancelation **[CHAT-22]**

### Added

- Prod stripe **[CHAT-2]**

### 0.0.16 (2025-06-26)

### Added

- bot chat pages with export and filters

### Fixed

- bot model options
- form field name
- review pricing model
- bot knowledge management

### 0.0.12 (2025-06-25)

### Added

- multiple documentation pages

### 0.0.11 (2025-06-25)

### Added

- basic mobil support
- kb management on the bot
- ui improvments
- SEO optimization

### Fixed

### 0.0.9 (2025-06-24)

### Added

- advance bot settings
- streming option for chat
- fix integration files on the setup wizzard
- updated settings page UI
- allow for kb actions

### Fixed

- Fix auth path from social login
- subscription link to stripe
- multiple KB items per chatbot

### 0.0.7 (2025-06-23)

### Added

- footer links with their pages.
- bolt branding
- dark mode support

### 0.0.5 (2025-06-23)

### Added

- toast notification

### 0.0.4 (2025-06-22)

### Added

- Redesigned the **Chatbot Settings Page** for improved UX:
  - Refactored layout and form sections for clarity.
  - Added bot status toggle switch (uses `status` column).
  - Moved **Delete Chatbot** and **Copy Chatbot URL** into settings.
  - Included visual save confirmation and error states.
- Introduced **Advanced Settings** section (UI only, logic pending):
  - Response temperature and max tokens fields (disabled for now).

### Fixed

- fixing broken UI for analytics on the dashboard
- fix basic token calculation to enable proper analitycs and a divition between chat and trainning

### 0.0.4 (2025-06-22)

### Added

- Role template system with default values: `bot_avatar`, `placeholder`, `welcome_message`, and `system_instructions`.
- Seeding script for `bot_role_templates` with multiple predefined roles (e.g. Support, Sales, Training).
- Extended chatbot creation logic to apply default values from the selected role template.
- Added editable chatbot settings for `welcome_message`, `placeholder`, `bot_avatar`, and `system_instructions`.
- Implemented `bot-metadata` Edge Function for headless use.
- Dynamic metadata loading in the embeddable `<ProfessionalChat>` widget.
- Full support for headless chatbot embedding using `botId`, `apiKey`, and `apiUrl`.

### Fixed

- Type error on `system_instructions` during chatbot creation.
- Metadata not populating correct welcome message in embedded widget.
- Widget placeholder and name now reflect role template correctly.

### [0.0.3](https://github.com/MikeRubio/dialogwit/compare/v0.0.2...v0.0.3) (2025-06-22)

### [0.0.2](https://github.com/MikeRubio/dialogwit/compare/v0.0.1...v0.0.2) (2025-06-22)

### Fixed

- token usage on the billing and dash section.

### 0.0.1 (2025-06-21)

## [1.0.0] - 2025-06-22

### Added

- Account deletion flow via Edge Function
- Cascade delete on all related tables
- Stripe subscription cancellation logic
- Confirmation modal with token info before deletion

### Fixed

- `auth.admin.deleteUser` breaking due to foreign key constraints
- Stripe error handling on deleted subscriptions
