# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.2](https://github.com/MikeRubio/dialogwit/compare/v0.0.1...v0.0.2) (2025-06-22)

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
