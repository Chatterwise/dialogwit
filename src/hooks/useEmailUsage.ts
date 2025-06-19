import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
// import { useTrackUsage, useUsageCheck } from "./useBilling";
// import { useSubscriptionStatus } from "./useStripe";

// Cache for email usage check results
const emailCheckCache: {
  allowed: boolean;
  timestamp: number;
} = {
  allowed: true,
  timestamp: 0,
};

const CACHE_TTL = 60000; // 1 minute cache TTL

export const useEmailUsage = () => {
  const { user } = useAuth();
  // const trackUsage = useTrackUsage();
  // const usageCheck = useUsageCheck();
  // const { hasActiveSubscription } = useSubscriptionStatus();
  const queryClient = useQueryClient();

  // Track email usage
  const trackEmail = async () => {
    if (!user) return { allowed: false };

    try {
      // First check if we're allowed to send more emails
      const now = Date.now();
      // let checkResult;

      // Use cached result if available and not expired
      if (now - emailCheckCache.timestamp < CACHE_TTL) {
        console.log("Using cached email usage check result");
        // checkResult = { allowed: emailCheckCache.allowed };
      } else {
        // Otherwise, perform the check
        // checkResult = await usageCheck.mutateAsync("emails_per_month");

        // Update cache
        // emailCheckCache.allowed = checkResult.allowed;
        emailCheckCache.timestamp = now;
      }

      // if (!checkResult.allowed) {
      //   return { allowed: false, reason: "limit_reached" };
      // }

      // // Track the usage
      // await trackUsage.mutateAsync({
      //   metricName: "emails_per_month",
      //   increment: count,
      // });

      // Invalidate queries to refresh usage data
      queryClient.invalidateQueries({ queryKey: ["user_subscription"] });

      return { allowed: true };
    } catch (error) {
      console.error("Failed to track email usage:", error);
      return { allowed: false, reason: "error", error };
    }
  };

  // Check if sending emails is allowed
  const checkEmailAllowed = async () => {
    if (!user) return false;

    try {
      const now = Date.now();

      // Use cached result if available and not expired
      if (now - emailCheckCache.timestamp < CACHE_TTL) {
        console.log("Using cached email permission check");
        return emailCheckCache.allowed;
      }

      // Otherwise, perform the check
      // const result = await usageCheck.mutateAsync("emails_per_month");

      // Update cache
      // emailCheckCache.allowed = result.allowed;
      emailCheckCache.timestamp = now;

      // return result.allowed;
    } catch (error) {
      console.error("Failed to check email usage:", error);
      throw new Error("Failed to check email usage");
    }
  };

  return {
    trackEmail,
    checkEmailAllowed,
    // isLoading: trackUsage.isPending || usageCheck.isPending,
    // hasActiveSubscription,
  };
};
