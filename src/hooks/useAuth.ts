import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let hasSentWelcome = false;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Send welcome email when user signs up and confirms email
      if (event === "SIGNED_IN" && session?.user && !hasSentWelcome) {
        hasSentWelcome = true;

        try {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email/welcome`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${
                  (
                    await supabase.auth.getSession()
                  ).data.session?.access_token ?? ""
                }`,
              },
            }
          );
        } catch (error) {
          console.error("Failed to send welcome email:", error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/auth/confirm",
        data: {
          full_name: email.split("@")[0],
        },
      },
    });

    // If signup is successful, send confirmation email
    if (data && !error) {
      try {
        await fetch(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/functions/v1/email/confirm-signup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${
                (await supabase.auth.getSession()).data.session?.access_token ??
                ""
              }`,
            },
            body: JSON.stringify({
              email,
              confirmUrl: window.location.origin + "/auth/confirm",
            }),
          }
        );
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't return this error as it's not critical to the signup process
      }
    }

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
};
