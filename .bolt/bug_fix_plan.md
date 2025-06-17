# Bug Fix Plan

This document outlines the plan to fix bugs and implement missing features to ensure all dashboard, billing, analytics, and settings modules use real, accurate, and plan-aware data.

## 1. Billing & Usage – Usage Overview

- [x] Replace all mock data in the Usage Overview with real, live data from the database
  - [x] Implement `useUserSubscription` hook to fetch subscription and usage data
  - [x] Create `BillingDashboard` component with real usage metrics
  - [x] Connect to Stripe API for subscription status

- [x] Ensure usage metrics (tokens, chatbots, emails, etc.) scale and display correctly based on the user's current subscription plan
  - [x] Create usage tracking system with plan limits
  - [x] Implement usage limit checks before performing actions
  - [x] Display appropriate warnings when approaching limits

- [x] Display token usage for the current month, not just total messages
  - [x] Track token usage separately from message count
  - [x] Show current period usage with progress bars
  - [x] Add visual indicators for approaching limits

## 2. Settings – Profile

- [ ] Implement the Profile section to fetch and update real user data (name, email, avatar, etc.)
  - [ ] Create `useProfile` hook to manage user profile data
  - [ ] Implement avatar upload functionality
  - [ ] Add form validation and error handling
  - [ ] Connect to Supabase storage for avatar uploads

- [ ] Ensure changes persist to the backend and reflect instantly in the UI
  - [ ] Add optimistic updates for better UX
  - [ ] Implement proper error handling and recovery
  - [ ] Add loading states during updates

## 3. Settings – Email Settings

- [x] Implement Email Settings using real user data and backend integration
  - [x] Create `useEmailUsage` hook to track and check email usage
  - [x] Implement `EmailSettings` component with real settings
  - [x] Add email templates management

- [x] Enforce and display email sending limits based on the user's current plan
  - [x] Create `EmailLimitGuard` component to prevent exceeding limits
  - [x] Implement usage tracking for emails sent
  - [x] Add visual indicators for approaching limits

- [x] Show actual usage (emails sent) and disable/enable features as per plan
  - [x] Create `EmailUsageDisplay` component to show current usage
  - [x] Disable email features when limit is reached
  - [x] Add upgrade prompts when limits are reached

## 4. Settings – Security

- [ ] Fully implement Security Settings (password change, 2FA, API key management, etc.) with real backend logic
  - [ ] Create API key management system
  - [ ] Implement password change functionality
  - [ ] Add 2FA setup and management
  - [ ] Implement security audit logging

- [ ] Remove any placeholders or mock UI
  - [ ] Replace all mock security data with real data
  - [ ] Implement proper error handling
  - [ ] Add loading states during security operations

## 5. Delete Account

- [ ] Ensure deleting an account also cancels any active recurring billing/subscription (e.g., via Stripe API)
  - [ ] Create account deletion endpoint
  - [ ] Add Stripe subscription cancellation
  - [ ] Implement confirmation flow with warnings

- [ ] Remove all user data securely and confirm deletion to the user
  - [ ] Create data cleanup process
  - [ ] Add cascading deletion for all user resources
  - [ ] Implement audit logging for account deletion
  - [ ] Show confirmation message after successful deletion

## 6. Chatbot Creation & Plan Enforcement

- [ ] Enforce chatbot creation limits based on the user's current plan
  - [ ] Add limit check before chatbot creation
  - [ ] Track chatbot count in usage metrics
  - [ ] Update UI to show current usage vs. limit

- [ ] Prevent creation if the user is at their limit and prompt upgrade
  - [ ] Create `UsageLimitGuard` component for chatbot creation
  - [ ] Add upgrade modal when limit is reached
  - [ ] Implement clear error messages explaining the limit

## 7. Advanced Analytics

- [ ] Replace all mock data in analytics with real, live data from chat logs and usage
  - [ ] Create analytics data fetching hooks
  - [ ] Implement real-time data processing
  - [ ] Add date range filtering

- [ ] Display real metrics for message volume, user satisfaction, query resolution, and token usage
  - [ ] Create visualization components for analytics data
  - [ ] Implement export functionality for reports
  - [ ] Add trend analysis for key metrics

## 8. Dashboard – Real Data

- [ ] Show real Recent Activity and Messages This Week, not mock data
  - [ ] Fetch actual recent activity from database
  - [ ] Create activity feed component with real data
  - [ ] Implement proper loading and error states

- [ ] Replace "Total Messages" with "Tokens Used This Month," calculated from actual usage and aligned with the user's plan
  - [ ] Track token usage separately
  - [ ] Show usage relative to plan limits
  - [ ] Add visual indicators for approaching limits

## Requirements

- [ ] All mock data must be removed and replaced with live, backend-driven data
  - [ ] Audit all components for mock data
  - [ ] Create real data fetching hooks
  - [ ] Implement proper loading and error states

- [ ] All plan limits and usage caps must be strictly enforced and reflected in the UI
  - [ ] Create limit enforcement system
  - [ ] Add visual indicators for limits
  - [ ] Implement upgrade prompts

- [ ] All changes must be fully tested and documented
  - [ ] Add comprehensive error handling
  - [ ] Document all new APIs and hooks
  - [ ] Test all limit enforcement scenarios

- [ ] Ensure compliance with privacy and security best practices
  - [ ] Implement proper data sanitization
  - [ ] Add audit logging for sensitive operations
  - [ ] Ensure secure handling of API keys and credentials