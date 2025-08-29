import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, ChevronRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCreateChatbot } from "../hooks/useChatbots";
import { useEmail } from "../hooks/useEmail";
import { useTranslation } from "../hooks/useTranslation";
import { useLanguage } from "../contexts/LanguageContext";

export const ChatbotBuilder = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage(); // ensure redirects keep /:lang
  const navigate = useNavigate();
  const { user } = useAuth();
  const createChatbot = useCreateChatbot();
  const { sendNewChatbotEmail } = useEmail();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    welcome_message: "",
    fallback_message: "",
    placeholder: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name.trim() || !formData.description.trim()) return;
    setIsSubmitting(true);

    try {
      const chatbot = await createChatbot.mutateAsync({
        name: formData.name,
        description: formData.description,
        user_id: user.id,
        welcome_message: formData.welcome_message || null,
        fallback_message: formData.fallback_message || null,
        placeholder:
          formData.placeholder || t("builder_placeholder_default", "Ask me anything..."),
        bot_avatar: null,
        status: "processing",
      });

      // optional email
      sendNewChatbotEmail.mutate({
        chatbotId: chatbot.id,
        chatbotName: formData.name,
      });

      // KEEP /:lang in the URL
      navigate(`/${currentLanguage}/chatbots/${chatbot.id}?tab=knowledge`);
    } catch (error) {
      console.error("Error creating chatbot:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
        <div className="text-center">
          <Bot className="h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("builder_title", "Create Your Chatbot")}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t(
              "builder_subtitle",
              "Give your chatbot a name and basic messages."
            )}
          </p>
        </div>

        <form className="space-y-6 mt-8" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("builder_field_name_label", "Chatbot Name")}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
              placeholder={t(
                "builder_field_name_placeholder",
                "e.g., Customer Support Bot"
              )}
              required
              aria-label={t("builder_field_name_label", "Chatbot Name")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("cb_settings_label_welcome", "Welcome Message")}
            </label>
            <input
              type="text"
              value={formData.welcome_message}
              onChange={(e) =>
                setFormData({ ...formData, welcome_message: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
              placeholder={t(
                "cb_settings_ph_welcome",
                "Hello! How can I help you today?"
              )}
              aria-label={t("cb_settings_label_welcome", "Welcome Message")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("builder_field_description_label", "Description")}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
              placeholder={t(
                "builder_field_description_placeholder",
                "Describe what your chatbot will help with..."
              )}
              required
              aria-label={t("builder_field_description_label", "Description")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("cb_settings_label_fallback", "Fallback (No-answer) Message")}
            </label>
            <input
              type="text"
              value={formData.fallback_message}
              onChange={(e) =>
                setFormData({ ...formData, fallback_message: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
              placeholder={t(
                "cb_settings_ph_fallback",
                "Sorry, I don’t have that information yet."
              )}
              aria-label={t(
                "cb_settings_label_fallback",
                "Fallback (No-answer) Message"
              )}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t(
                "cb_settings_help_fallback",
                "Used when the bot can’t find the answer in its knowledge files."
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("cb_settings_label_placeholder", "Input Placeholder")}
            </label>
            <input
              type="text"
              value={formData.placeholder}
              onChange={(e) =>
                setFormData({ ...formData, placeholder: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
              placeholder={t("cb_settings_ph_placeholder", "Type your message...")}
              aria-label={t("cb_settings_label_placeholder", "Input Placeholder")}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t(
                "cb_settings_help_placeholder",
                "Text shown in the input field before the user types"
              )}
            </p>
          </div>

          <button
            type="submit"
            disabled={
              !formData.name.trim() ||
              !formData.description.trim() ||
              isSubmitting
            }
            className="flex items-center justify-center w-full px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 dark:bg-primary-500 border border-transparent rounded-xl shadow-card hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 disabled:opacity-60"
            aria-label={
              isSubmitting
                ? t("builder_btn_creating", "Creating...")
                : t("builder_btn_create", "Create Chatbot")
            }
            title={
              isSubmitting
                ? t("builder_btn_creating", "Creating...")
                : t("builder_btn_create", "Create Chatbot")
            }
          >
            {isSubmitting
              ? t("builder_btn_creating", "Creating...")
              : t("builder_btn_create", "Create Chatbot")}
            <ChevronRight className="h-4 w-4 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
};
