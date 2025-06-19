import { useState, useEffect } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  emailConfirmed: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    emailConfirmed: false,
  });

  useEffect(() => {
    let isMounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        const emailConfirmed = checkEmailConfirmed(session);
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          emailConfirmed,
        });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // console.log(
      //   "Auth state change:",
      //   event,
      //   session?.user?.email_confirmed_at
      // );

      // Use setTimeout to avoid deadlocks in the callback
      setTimeout(() => {
        if (isMounted) {
          const emailConfirmed = checkEmailConfirmed(session);

          setAuthState({
            user: session?.user ?? null,
            session,
            loading: false,
            emailConfirmed,
          });

          // Handle email confirmation asynchronously
          if (event === "SIGNED_IN" && session?.user && emailConfirmed) {
            handleEmailConfirmation(session);
          }
        }
      }, 0);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // GitHub OAuth sign-in
  const signInWithGitHub = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("GitHub sign-in error:", error);
      return { data: null, error: error as AuthError };
    }
  };
  // Discord OAuth sign-in
  const signInWithDiscord = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Discord sign-in error:", error);
      return { data: null, error: error as AuthError };
    }
  };

  // Robust email confirmation check
  const checkEmailConfirmed = (session: Session | null): boolean => {
    if (!session?.user) return false;

    const user = session.user;

    // Check multiple sources for email confirmation
    return !!(
      user.email_confirmed_at ||
      user.user_metadata?.email_verified ||
      user.identities?.some(
        (identity) => identity.identity_data?.email_verified
      )
    );
  };

  // Handle email confirmation in a separate async function
  const handleEmailConfirmation = async (session: Session) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/functions/v1/email-confirmation-handler`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        // const errorData = await response.json();
        // console.error("Email confirmation handler error:", errorData);
      } else {
        // const result = await response.json();
        // console.log("Email confirmation handler result:", result);
      }
    } catch  {
      // console.error("Email confirmation handler error:", error);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) throw error;

      // Send confirmation email immediately after signup
      if (data.user && !data.user.email_confirmed_at) {
        try {
          const confirmResponse = await fetch(
            `${
              import.meta.env.VITE_SUPABASE_URL
            }/functions/v1/email-confirm-signup`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email,
                confirmUrl: `${window.location.origin}/auth/confirm`,
              }),
            }
          );

          if (!confirmResponse.ok) {
            const errorData = await confirmResponse.json();
            console.error("Failed to send confirmation email:", errorData);
          } else {
            console.log("Confirmation email sent successfully");
          }
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error("Signup error:", error);
      return { data: null, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Signin error:", error);
      return { data: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Signout error:", error);
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      // Send reset password email
      try {
        const resetResponse = await fetch(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/functions/v1/email-reset-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              resetUrl: `${window.location.origin}/auth/reset-password`,
            }),
          }
        );

        if (!resetResponse.ok) {
          const errorData = await resetResponse.json();
          console.error("Failed to send reset password email:", errorData);
        }
      } catch (emailError) {
        console.error("Error sending reset password email:", emailError);
      }

      return { data, error: null };
    } catch (error) {
      console.error("Reset password error:", error);
      return { data: null, error: error as AuthError };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      
      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/functions/v1/email-confirm-signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            confirmUrl: `${window.location.origin}/auth/confirm`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to resend confirmation email"
        );
      }

      return { error: null };
    } catch (error) {
      console.error("Resend confirmation error:", error);
      return { error: error as Error };
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendConfirmation,
    signInWithGitHub,
    signInWithDiscord,
  };
}
