import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, ChevronRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCreateChatbot, useRoleTemplates } from "../hooks/useChatbots";
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
  const { data: templates } = useRoleTemplates();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    bot_role_template_id: null as string | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name.trim() || !formData.description.trim()) return;
    setIsSubmitting(true);

    try {
      const selectedTemplate = templates?.find(
        (t) => t.id === formData.bot_role_template_id
      );
      const chatbot = await createChatbot.mutateAsync({
        name: formData.name,
        description: formData.description,
        user_id: user.id,
        bot_role_template_id: formData.bot_role_template_id,
        placeholder:
          selectedTemplate?.placeholder ??
          t("builder_placeholder_default", "Ask me anything..."),
        bot_avatar: selectedTemplate?.bot_avatar ?? null,
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
              "Give your chatbot a name, role and description."
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
              {t("builder_field_template_label", "Role Template")}
            </label>
            <select
              value={formData.bot_role_template_id ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bot_role_template_id: e.target.value || null,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
              aria-label={t("builder_field_template_label", "Role Template")}
            >
              <option value="">
                {t("builder_field_template_none", "No role template")}
              </option>
              {templates?.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {t(
                "builder_field_template_help",
                "Select a predefined chatbot behavior."
              )}
            </p>
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
