import { useState } from "react";
import { supabase } from "../lib/supabase";

export const useStripe = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (priceId: string, mode = "subscription") => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("You must be logged in to create a checkout session");

      // derive current lang from the first path segment (fallback to "en")
      const segments = window.location.pathname.split("/").filter(Boolean);
      const lang = segments[0] || "en";
      const base = `${window.location.origin}/${lang}`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            // optional but recommended for Edge Functions
            // apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
            // Accept: "application/json",
          },
          body: JSON.stringify({
            user_id: session.user.id,
            price_id: priceId,
            mode,
            // include lang + session id placeholder for your SuccessPage
            success_url: `${base}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${base}/cancel`,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create checkout session");
      }

      const { url } = await response.json();
      if (!url) throw new Error("No checkout URL received");

      // use assign to replace location
      window.location.assign(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
      console.error("Stripe checkout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("You must be logged in");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-cancel-subscription`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            // apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
            // Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to cancel subscription");
      }

      const result = await response.json();
      console.log("Subscription cancelled:", result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
      console.error("Cancel subscription error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckoutSession,
    cancelSubscription,
    isLoading,
    error,
  };
};
