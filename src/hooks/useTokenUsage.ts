import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

export interface TokenUsageMetric {
  current_usage: number;
  limit_value: number;
  remaining: number;
  percentage_used: number;
  overage_amount: number;
  overage_price_per_token: number;
  usage_events: number;
}

export interface TokenUsageData {
  user_id: string;
  billing_period: {
    start: string;
    end: string;
    days_elapsed: number;
    days_total: number;
  };
  subscription: {
    plan_name: string;
    status: string;
    monthly_price: number;
  };
  usage: {
    [key: string]: TokenUsageMetric;
  };
  trends: Array<{
    date: string;
    total_tokens: number;
    metrics: { [key: string]: number };
  }>;
  costs: {
    breakdown: {
      [key: string]: {
        tokens: number;
        cost: number;
      };
    };
    current_month_total: number;
    projected_month_total: number;
    days_remaining: number;
  };
  last_updated: string;
}

export interface TokenTrend {
  date: string;
  total_tokens: number;
  metrics: { [key: string]: number };
}

export function useTokenUsage() {
  const { user } = useAuth();
  const [data, setData] = useState<TokenUsageData | null>(null);
  const [trends, setTrends] = useState<TokenTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenUsage = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);

      // Get comprehensive usage data
      const { data: usageData, error: usageError } = await supabase.rpc(
        "get_user_token_usage",
        { p_user_id: user.id }
      );
      if (usageError) throw usageError;

      // Get trends data
      const { data: trendsData, error: trendsError } = await supabase.rpc(
        "get_token_usage_trends",
        {
          p_user_id: user.id,
          p_days: 30,
        }
      );

      if (trendsError) throw trendsError;

      setData(usageData);
      setTrends(trendsData || []);
    } catch (err) {
      console.error("Error fetching token usage:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch token usage"
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshUsage = () => {
    setLoading(true);
    fetchTokenUsage();
  };

  useEffect(() => {
    fetchTokenUsage();
  }, [user]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchTokenUsage, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  return {
    data,
    trends,
    loading,
    error,
    refreshUsage,
  };
}
