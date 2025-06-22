Webhooks in ChatterWise are designed to provide real-time, event-driven notifications to external systems or applications. Their primary intention is to enable seamless integration and automation by allowing your external services to react instantly to specific events occurring within your ChatterWise chatbots or platform.

Here's how webhooks are intended to be used:

Real-time Notifications: Instead of constantly polling the ChatterWise API for updates, you can set up a webhook to receive immediate notifications when an event you care about happens. This is crucial for building responsive and efficient integrations.
Automating Workflows: Webhooks allow you to trigger custom actions or workflows in your own applications. For example:
When a new message is received by your chatbot, a webhook can send that message to your CRM system.
If a chatbot's knowledge base is updated, a webhook could trigger a re-indexing process in an external search engine.
For billing events (like Stripe payments), webhooks ensure your system is immediately aware of subscription changes or successful payments.
Data Synchronization: You can use webhooks to keep data synchronized between ChatterWise and your other platforms. When a chatbot is created or updated, a webhook can push that information to your internal management tools.
Custom Logic: Webhooks provide a flexible way to extend ChatterWise's functionality with your own custom code. You can write a serverless function or an endpoint in your application that listens for webhook events and executes specific logic tailored to your needs.
How to use them:

Define a Webhook: You would typically create a webhook through the ChatterWise dashboard (as seen in the WebhookManager component). You'll specify:
A Name for your webhook.
A URL (your endpoint) where ChatterWise will send the event data.
The specific Events you want to subscribe to (e.g., message_received, chatbot_updated).
An optional Secret key, which allows your receiving application to verify that the webhook request genuinely came from ChatterWise and hasn't been tampered with.
Whether the webhook is Active or inactive.
Receive Events: When a subscribed event occurs, ChatterWise sends an HTTP POST request to your specified URL. This request contains a JSON payload with details about the event.
Process the Payload: Your application at the receiving URL processes this JSON payload. You can then extract the relevant information and perform any desired actions.
Security Verification: If you provided a secret, your application should use it to compute a signature and compare it with the signature provided in the webhook request headers. This ensures the authenticity and integrity of the incoming data.
In essence, webhooks act as a bridge, allowing ChatterWise to "talk" to your other systems in real-time, enabling a more dynamic and integrated experience.

To support webhooks with Supabase, the primary configuration involves setting up Supabase Edge Functions to act as your webhook endpoints and securely managing any necessary credentials using Supabase Secrets.

Here's how the configuration would typically be structured:

Supabase Edge Functions as Webhook Endpoints:

You would write serverless functions (Edge Functions) in TypeScript or JavaScript that are deployed to your Supabase project. These functions will be the HTTP endpoints that receive the POST requests from ChatterWise when a webhook event is triggered.
For example, if you have a webhook for message_received events, you might have an Edge Function at https://your-project-ref.supabase.co/functions/v1/webhooks/message-received that processes these events.
The deploy-functions.md file in your project provides commands for deploying these functions, such as supabase functions deploy customer-portal or supabase functions deploy stripe-checkout. You would follow a similar process for your custom webhook functions.
Supabase Secrets for Secure Credentials:

Any sensitive information that your webhook functions need to access (like API keys for external services, or a secret key to verify incoming webhook payloads) should be stored as Supabase Secrets. This keeps them out of your codebase and environment variables in your local development setup.
You can set these secrets directly in the Supabase Dashboard under Project Settings → Edge Functions, or via the Supabase CLI.
The deploy-functions.md file explicitly mentions setting STRIPE_SECRET_KEY and RESEND_API_KEY as examples, which is the same mechanism you'd use for any webhook-specific secrets. For instance, if your webhook requires a WEBHOOK_SIGNING_SECRET to verify payloads, you would set it like this:

supabase secrets set WEBHOOK_SIGNING_SECRET=your_super_secret_string
Database Interaction (Optional but Common):

Many webhooks interact with your Supabase database. For example, a webhook triggered by a new message might insert that message into your chat_messages table.
You'll need to ensure that your database schema (as provided in the project's schema information) is correctly set up with the necessary tables (e.g., webhooks, audit_logs, chat_messages).
Row Level Security (RLS) policies on these tables are crucial. Your Edge Functions will typically interact with the database using a service_role key or by passing a user's JWT, and your RLS policies must allow the necessary INSERT, UPDATE, or SELECT operations for the function to succeed. The webhooks table, for instance, has policies allowing authenticated users to manage their own webhooks.
By following these steps, your Supabase project will be configured to securely receive and process webhook events, enabling robust integrations with ChatterWise.
