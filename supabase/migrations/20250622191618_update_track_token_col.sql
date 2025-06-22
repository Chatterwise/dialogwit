-- 1. Ensure the usage_tracking table has expected columns
create table if not exists public.usage_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  chatbot_id uuid references public.chatbots(id) on delete set null,
  subscription_id uuid references public.stripe_subscriptions(id) on delete set null,
  metric_name text not null,
  metric_value integer not null,
  usage_source text default 'chat', -- e.g., 'chat', 'training', 'fallback'
  period_start timestamp with time zone,
  period_end timestamp with time zone,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- 2. Drop the broken function if it exists
drop function if exists public.track_token_usage(
  uuid,
  text,
  integer,
  jsonb,
  text,
  uuid
);

-- 3. Re-create the function using metric_value (not token_count)
create or replace function public.track_token_usage(
  p_user_id uuid,
  p_metric_name text,
  p_token_count integer,
  p_metadata jsonb default '{}'::jsonb,
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
    metric_value,
    metadata,
    usage_source,
    chatbot_id,
    created_at
  )
  values (
    p_user_id,
    p_metric_name,
    p_token_count,
    p_metadata,
    p_usage_source,
    p_chatbot_id,
    now()
  );
end;
$$;
