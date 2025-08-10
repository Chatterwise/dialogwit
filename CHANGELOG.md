# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [Unreleased]

### Fixed

- Reposition add knowledge button in KnowledgeBase.tsx. **[CHAT-7]**
- Added ScrollToTop to the ../docs/getting-started/introduction, ../docs/getting-started/first-chatbot, ../docs/getting-started/knowledge-base, /training-chatbot, All /docs/integrations pages, all /docs/advanced-features pages **[CHAT-25]**
- Removed non drafted entries from tutorials page. **[CHAT-25]**
- Profile Picture upload issue  **[CHAT-20]**
- Chatbot status is not updating properly **[CHAT-26]**
- Added a markdown parcer of the main chatbot of the app **[CHAT-24]**

### Added
- Profile picture on the header **[CHAT-27]**

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
