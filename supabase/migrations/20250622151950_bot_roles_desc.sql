-- 1. Add missing column
ALTER TABLE bot_role_templates
ADD COLUMN IF NOT EXISTS system_instructions text;

-- 2. Seed default role templates with instructions
INSERT INTO bot_role_templates (id, name, icon_name, description, system_instructions)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Support Bot', 'headset', 'Answers support questions and FAQs.', 'You are a helpful support assistant. Answer clearly and concisely.'),
  ('00000000-0000-0000-0000-000000000002', 'Sales Bot', 'handshake', 'Handles product questions and converts leads.', 'You are a persuasive sales assistant. Highlight benefits and close the deal.'),
  ('00000000-0000-0000-0000-000000000003', 'Training Bot', 'graduation-cap', 'Helps train users or staff on a topic.', 'You are a friendly training assistant. Teach step-by-step with examples.'),
  ('00000000-0000-0000-0000-000000000004', 'FAQ Bot', 'book-open', 'Responds with predefined FAQ responses.', 'You answer only based on known FAQ answers. Be short and direct.'),
  ('00000000-0000-0000-0000-000000000005', 'Onboarding Bot', 'compass', 'Guides new users through getting started.', 'You guide users through onboarding. Be welcoming and clear.'),
  ('00000000-0000-0000-0000-000000000006', 'Survey Bot', 'clipboard-check', 'Collects feedback and runs surveys.', 'You are a survey bot. Ask relevant questions and summarize responses.'),
  ('00000000-0000-0000-0000-000000000007', 'Custom Bot', 'settings', 'Fully customizable behavior and responses.', 'This bot is fully user-configurable.'),
  ('00000000-0000-0000-0000-000000000008', 'Knowledge Bot', 'book', 'Searches and answers from uploaded documents.', 'You are a document expert. Answer using uploaded knowledge base only.')
ON CONFLICT (id) DO NOTHING;
