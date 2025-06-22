-- Seed bot_role_templates with predefined roles
INSERT INTO bot_role_templates (id, name, icon_name, description)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Support Bot', 'headset', 'Answers support questions and FAQs.'),
  ('00000000-0000-0000-0000-000000000002', 'Sales Bot', 'handshake', 'Handles product questions and converts leads.'),
  ('00000000-0000-0000-0000-000000000003', 'Training Bot', 'graduation-cap', 'Helps train users or staff on a topic.'),
  ('00000000-0000-0000-0000-000000000004', 'FAQ Bot', 'book-open', 'Responds with predefined FAQ responses.'),
  ('00000000-0000-0000-0000-000000000005', 'Onboarding Bot', 'compass', 'Guides new users through getting started.'),
  ('00000000-0000-0000-0000-000000000006', 'Survey Bot', 'clipboard-check', 'Collects feedback and runs surveys.'),
  ('00000000-0000-0000-0000-000000000007', 'Custom Bot', 'settings', 'Fully customizable behavior and responses.'),
  ('00000000-0000-0000-0000-000000000008', 'Knowledge Bot', 'book', 'Searches and answers from uploaded documents.')
ON CONFLICT (id) DO NOTHING;
