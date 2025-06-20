
import { useState } from "react";
import { supabase } from "../lib/supabase";

export const useStripe = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCheckoutSession = async (priceId, mode = "subscription") => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) throw new Error("You must be logged in to create a checkout session");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user_id: session.user.id,
            price_id: priceId,
            mode,
            success_url: `${window.location.origin}/success`,
            cancel_url: `${window.location.origin}/cancel`
          })
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to create checkout session";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Stripe checkout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { createCheckoutSession, isLoading, error };
};
