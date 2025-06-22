-- 1. Drop any conflicting overloaded versions
drop function if exists public.track_token_usage(
  uuid, text, integer, jsonb, text, uuid
);
drop function if exists public.track_token_usage(
  uuid, uuid, text, integer, text, jsonb
);

-- 2. Create the correct version with proper ordering
create or replace function public.track_token_usage(
  p_user_id uuid,
  p_chatbot_id uuid,
  p_metric_name text,
  p_token_count integer,
  p_usage_source text default 'chat',
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
as $$
declare
  sub_record record;
begin
  -- Get the latest subscription for the user
  select id, current_period_start, current_period_end
  into sub_record
  from user_subscriptions
  where user_id = p_user_id
  order by current_period_start desc
  limit 1;

  if sub_record.id is null then
    raise exception 'No active subscription found for user %', p_user_id;
  end if;

  -- Insert token usage
  insert into usage_tracking (
    user_id,
    subscription_id,
    chatbot_id,
    metric_name,
    metric_value,
    usage_source,
    period_start,
    period_end,
    created_at,
    metadata
  )
  values (
    p_user_id,
    sub_record.id,
    p_chatbot_id,
    p_metric_name,
    p_token_count,
    p_usage_source,
    sub_record.current_period_start,
    sub_record.current_period_end,
    now(),
    p_metadata
  );
end;
$$;
