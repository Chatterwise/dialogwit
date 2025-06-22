-- 1. Ensure `usage_source` column exists with enum check
alter table usage_tracking
  add column if not exists usage_source text check (usage_source in ('chat', 'training')) default 'chat';

-- 2. Ensure `chatbot_id` column exists with FK to chatbots
alter table usage_tracking
  add column if not exists chatbot_id uuid references chatbots(id);

-- 3. Drop the old function if it exists
drop function if exists public.track_token_usage;

-- 4. Create the updated function
create or replace function public.track_token_usage(
  p_user_id uuid,
  p_metric_name text,
  p_token_count integer,
  p_metadata jsonb,
  p_usage_source text default 'chat',
  p_chatbot_id uuid default null
)
returns void
language plpgsql
as $$
begin
  insert into usage_tracking (
    user_id,
    metric_name,
    token_count,
    metadata,
    usage_source,
    chatbot_id
  ) values (
    p_user_id,
    p_metric_name,
    p_token_count,
    p_metadata,
    p_usage_source,
    p_chatbot_id
  );
end;
$$;
