-- Drop the old unique constraint (if it exists)
ALTER TABLE usage_tracking
DROP CONSTRAINT IF EXISTS usage_tracking_user_metric_period_key;

-- Add a new unique constraint that includes usage_source
ALTER TABLE usage_tracking
ADD CONSTRAINT usage_tracking_user_metric_period_key UNIQUE (
  user_id,
  metric_name,
  period_start,
  period_end,
  usage_source
);
