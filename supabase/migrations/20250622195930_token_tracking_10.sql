-- Drop the function first due to parameter default conflict
drop function if exists public.track_token_usage(
  uuid,
  uuid,
  text,
  integer,
  text,
  jsonb
);

-- Recreate the function without defaults
create function public.track_token_usage(
  p_user_id uuid,
  p_chatbot_id uuid,
  p_metric_name text,
  p_token_count integer,
  p_usage_source text,
  p_metadata jsonb
)
returns void
language plpgsql
as $$
declare
  current_period_start timestamptz;
  current_period_end timestamptz;
  subscription_id uuid;
begin
  -- Get active subscription
  select id, current_period_start, current_period_end
  into subscription_id, current_period_start, current_period_end
  from user_subscriptions
  where user_id = p_user_id
  order by updated_at desc
  limit 1;

  -- Insert or update usage
  insert into usage_tracking (
    user_id,
    subscription_id,
    metric_name,
    metric_value,
    period_start,
    period_end,
    usage_source,
    chatbot_id,
    metadata
  ) values (
    p_user_id,
    subscription_id,
    p_metric_name,
    p_token_count,
    current_period_start,
    current_period_end,
    p_usage_source,
    p_chatbot_id,
    p_metadata
  )
  on conflict (user_id, metric_name, period_start, period_end, usage_source)
  do update set
    metric_value = usage_tracking.metric_value + excluded.metric_value,
    chatbot_id = excluded.chatbot_id,
    metadata = excluded.metadata,
    updated_at = now();
end;
$$;
