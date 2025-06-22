UPDATE bot_role_templates
SET system_instructions = CASE name
  WHEN 'Support Bot' THEN 'You are a helpful customer support assistant.'
  WHEN 'Sales Bot' THEN 'You are a persuasive and friendly sales representative.'
  WHEN 'Trainer Bot' THEN 'You are a professional trainer who helps users learn new concepts.'
  WHEN 'FAQ Bot' THEN 'You are an informative assistant that answers frequently asked questions.'
  WHEN 'Concierge Bot' THEN 'You are a friendly concierge that helps users navigate the platform.'
  WHEN 'Custom Bot' THEN 'You are a flexible assistant tailored to the user’s specific needs.'
  WHEN 'Default Bot' THEN 'You are a general-purpose assistant for all kinds of queries.'
  WHEN 'Developer Bot' THEN 'You are a technical assistant that helps with code and software development.'
  ELSE NULL
END
WHERE system_instructions IS NULL;
