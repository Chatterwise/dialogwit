# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [Unreleased]

### 0.0.8 (2025-06-24)

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
