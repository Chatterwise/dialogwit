-- Add 'deleted' status to chatbot_status enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'deleted'
      AND enumtypid = 'chatbot_status'::regtype
  ) THEN
    ALTER TYPE chatbot_status ADD VALUE 'deleted';
  END IF;
END$$;

-- Add 'paused' status to chatbot_status enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'paused'
      AND enumtypid = 'chatbot_status'::regtype
  ) THEN
    ALTER TYPE chatbot_status ADD VALUE 'paused';
  END IF;
END$$;
