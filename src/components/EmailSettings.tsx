import { useState, useEffect } from "react";
import { AlertTriangle, Loader } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useEmail } from "../hooks/useEmail";
import { EmailSettingsForm } from "./EmailSettingsForm";

export const EmailSettings = () => {
  const { user } = useAuth();
  const { refetchSettings, updateEmailSettings } = useEmail();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        await refetchSettings();
      } catch (err) {
        console.error("Error loading email settings:", err);
        setError("Failed to load email settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
          <div>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <EmailSettingsForm />;
};
