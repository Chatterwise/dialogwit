# Production Deployment Checklist

## 1. Email Sending & Notifications (Highest Priority)
- [x] Enable transactional email sending via Resend for the app
- [x] Implement "Confirm Signup" and "Reset Password" emails using production templates
- [x] Implement user-configurable email settings:
  - [x] Enable Email Notifications (toggle, persisted per user)
  - [x] Daily Digest (send daily chatbot activity summary)
  - [x] Weekly Report (send weekly chatbot performance summary)
  - [x] Chatbot Alerts (notify when chatbots need attention)
  - [x] Marketing Emails (respect user opt-in/out)
- [x] Ensure all email settings are enforced in backend/email logic
- [x] Respect plan limits for email sending
- [x] Trigger email notification when a user creates a new bot

## 2. Billing & Usage Overview (High Priority)
- [ ] Replace all mock data in Usage Overview with real, live usage data
- [ ] Ensure usage metrics scale with the user's current plan and billing cycle
- [ ] Display tokens used this month (not just total messages)
- [ ] Show progress bars and alerts as users approach plan limits

## 3. Dashboard Improvements (High Priority)
- [ ] Display real token usage for the current billing cycle
- [ ] Show accurate "Recent Activity" and "Messages This Week" using live data

## 4. Advanced Analytics (High Priority)
- [ ] Replace mock data with real analytics from chat logs and usage
- [ ] Clarify "User Satisfaction" with rating breakdown and reasons
- [ ] Provide actionable insights, not just ambiguous scores

## 5. Settings Improvements (Medium Priority)
- [ ] Profile: Fetch and update real user data and ensure changes persist
- [ ] Email: Enforce and display email sending limits based on the user's plan
- [ ] Security: Implement password change, 2FA, and API key management

## 6. Delete Account (Medium Priority)
- [ ] Ensure deleting an account cancels any active recurring billing/subscription
- [ ] Securely remove all user data and confirm deletion to the user