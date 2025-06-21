import React, { useState } from "react";
import {
  Code,
  Download,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Palette,
  Zap,
  Settings,
  ExternalLink,
  Bot,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useChatbots } from "../hooks/useChatbots";
import { motion } from "framer-motion";

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

export const InstallationWizard = () => {
  const { user } = useAuth();
  const { data: chatbots = [], isLoading: chatbotsLoading } = useChatbots(
    user?.id || ""
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    framework: "",
    template: "modern",
    theme: "light",
    position: "bottom-right",
    botId: "",
    apiUrl: import.meta.env.VITE_SUPABASE_URL
      ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
      : "https://your-api.supabase.co/functions/v1",
    apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "your-api-key",
  });
  const [copiedCode, setCopiedCode] = useState(false);

  const steps: WizardStep[] = [
    {
      id: "framework",
      title: "Choose Your Framework",
      description: "Select the framework or platform you're using",
    },
    {
      id: "template",
      title: "Select Template Style",
      description: "Choose a chat template that matches your design",
    },
    {
      id: "configuration",
      title: "Configure Settings",
      description: "Select your chatbot and configure settings",
    },
    {
      id: "installation",
      title: "Installation Code",
      description: "Copy the generated code to your project",
    },
  ];

  const frameworks = [
    {
      id: "react",
      name: "React / Next.js",
      description: "Use beautiful template components",
      icon: "⚛️",
      type: "template",
    },
    {
      id: "vue",
      name: "Vue.js",
      description: "Universal script tag integration",
      icon: "💚",
      type: "script",
    },
    {
      id: "angular",
      name: "Angular",
      description: "Universal script tag integration",
      icon: "🅰️",
      type: "script",
    },
    {
      id: "svelte",
      name: "Svelte",
      description: "Universal script tag integration",
      icon: "🧡",
      type: "script",
    },
    {
      id: "vanilla",
      name: "Vanilla JS",
      description: "Pure JavaScript integration",
      icon: "🟨",
      type: "script",
    },
    {
      id: "wordpress",
      name: "WordPress",
      description: "Plugin or theme integration",
      icon: "📝",
      type: "script",
    },
    {
      id: "shopify",
      name: "Shopify",
      description: "Theme liquid template",
      icon: "🛍️",
      type: "script",
    },
    {
      id: "other",
      name: "Other",
      description: "Any other platform",
      icon: "🌐",
      type: "script",
    },
  ];

  const templates = [
    {
      id: "modern",
      name: "Modern",
      description: "Sleek gradient design with rounded corners",
      preview: "bg-gradient-to-r from-blue-500 to-purple-500",
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Clean and simple interface",
      preview: "bg-gray-100 border border-gray-300",
    },
    {
      id: "bubble",
      name: "Bubble",
      description: "Playful bubble-style messages",
      preview: "bg-gradient-to-r from-pink-400 to-rose-400",
    },
    {
      id: "professional",
      name: "Professional",
      description: "Corporate and business-focused",
      preview: "bg-slate-700",
    },
    {
      id: "gaming",
      name: "Gaming",
      description: "Gaming-inspired with neon accents",
      preview: "bg-gradient-to-r from-green-500 to-emerald-500",
    },
    {
      id: "elegant",
      name: "Elegant",
      description: "Sophisticated and refined",
      preview: "bg-gradient-to-r from-purple-500 to-indigo-500",
    },
  ];

  const generateCode = () => {
    const framework = frameworks.find((f) => f.id === selections.framework);

    if (framework?.type === "template") {
      return generateReactCode();
    } else {
      return generateScriptCode();
    }
  };

  const generateReactCode = () => {
    const templateName =
      selections.template.charAt(0).toUpperCase() +
      selections.template.slice(1);
    const selectedBot = chatbots.find((bot) => bot.id === selections.botId);

    return `import React, { useState } from 'react'
import { ${templateName}Chat } from './components/ChatTemplates'

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Your app content */}
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to My App
        </h1>
        
        {/* Chat trigger button */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors flex items-center justify-center z-40"
        >
          💬
        </button>
      </div>

      {/* Chat Template */}
      <${templateName}Chat
        botId="${selections.botId}"
        apiUrl="${selections.apiUrl}"
        apiKey="${selections.apiKey}"
        isOpen={isChatOpen}
        onToggle={setIsChatOpen}
        theme="${selections.theme}"
        position="${selections.position}"${
      selectedBot
        ? `
        botName="${selectedBot.name}"
        welcomeMessage="Hello! I'm ${selectedBot.name}. ${selectedBot.description} How can I help you today?"`
        : ""
    }
      />
    </div>
  )
}

export default App`;
  };

  const generateScriptCode = () => {
    const selectedBot = chatbots.find((bot) => bot.id === selections.botId);

    return `<!-- Add this script tag to your HTML -->
<script 
  src="https://your-domain.com/chatbot-widget.js" 
  data-bot-id="${selections.botId}"
  data-api-url="${selections.apiUrl}"
  data-api-key="${selections.apiKey}"
  data-template="${selections.template}"
  data-theme="${selections.theme}"
  data-position="${selections.position}"
  data-primary-color="#3B82F6"${
    selectedBot
      ? `
  data-bot-name="${selectedBot.name}"
  data-welcome-message="Hello! I'm ${selectedBot.name}. ${selectedBot.description} How can I help you today?"`
      : ""
  }
  async>
</script>`;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selections.framework !== "";
      case 1:
        return selections.template !== "";
      case 2:
        return (
          selections.botId !== "" &&
          selections.apiUrl !== "" &&
          selections.apiKey !== ""
        );
      default:
        return true;
    }
  };

  const readyChatbots = chatbots.filter((bot) => bot.status === "ready");

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight">
            Installation Wizard
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        <div className="flex items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center ${
                  index <= currentStep
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-400 dark:text-gray-600"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? "bg-primary-600 dark:bg-primary-700 text-white shadow-md"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:block">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    index < currentStep
                      ? "bg-primary-600 dark:bg-primary-700"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 min-h-[500px]"
      >
        {/* Step 1: Framework Selection */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {steps[0].title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {steps[0].description}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {frameworks.map((framework) => (
                <motion.button
                  key={framework.id}
                  onClick={() =>
                    setSelections({ ...selections, framework: framework.id })
                  }
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`p-4 border rounded-xl text-left transition-all duration-200 shadow-subtle ${
                    selections.framework === framework.id
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-200 dark:ring-primary-800"
                      : "border-gray-100 dark:border-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/10"
                  }`}
                >
                  <div className="text-2xl mb-2">{framework.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {framework.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {framework.description}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        framework.type === "template"
                          ? "bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300"
                          : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                      }`}
                    >
                      {framework.type === "template"
                        ? "React Templates"
                        : "Script Tag"}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Template Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {steps[1].title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {steps[1].description}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <motion.button
                  key={template.id}
                  onClick={() =>
                    setSelections({ ...selections, template: template.id })
                  }
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`border rounded-xl overflow-hidden transition-all duration-200 shadow-subtle ${
                    selections.template === template.id
                      ? "border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800"
                      : "border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-700"
                  }`}
                >
                  <div className={`h-20 ${template.preview} relative`}>
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                      <div className="w-6 h-6 bg-white/20 rounded-full" />
                    </div>
                  </div>
                  <div className="p-4 text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="text-center">
              <Link
                to="/templates"
                className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View live template gallery
              </Link>
            </div>
          </div>
        )}

        {/* Step 3: Configuration */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {steps[2].title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {steps[2].description}
              </p>
            </div>
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Chatbot Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Chatbot *
                </label>
                {chatbotsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 dark:border-primary-400"></div>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      Loading chatbots...
                    </span>
                  </div>
                ) : readyChatbots.length === 0 ? (
                  <div className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                          No Ready Chatbots Found
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                          You need to create and train a chatbot first before
                          you can integrate it.
                        </p>
                        <Link
                          to="/chatbots/new"
                          className="inline-flex items-center mt-2 text-sm font-medium text-yellow-800 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-200"
                        >
                          <Bot className="h-4 w-4 mr-1" />
                          Create a chatbot
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {readyChatbots.map((chatbot) => (
                      <motion.button
                        key={chatbot.id}
                        onClick={() =>
                          setSelections({ ...selections, botId: chatbot.id })
                        }
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`p-4 border rounded-xl text-left transition-all duration-200 shadow-subtle ${
                          selections.botId === chatbot.id
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-200 dark:ring-primary-800"
                            : "border-gray-100 dark:border-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/10"
                        }`}
                      >
                        <div className="flex items-center">
                          <Bot className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {chatbot.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {chatbot.description}
                            </p>
                            <div className="flex items-center mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                Ready
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                Created{" "}
                                {new Date(
                                  chatbot.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
              {/* Theme and Position Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={selections.theme}
                    onChange={(e) =>
                      setSelections({ ...selections, theme: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Position
                  </label>
                  <select
                    value={selections.position}
                    onChange={(e) =>
                      setSelections({ ...selections, position: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="center">Center</option>
                    <option value="fullscreen">Fullscreen</option>
                  </select>
                </div>
              </div>
              {/* API Configuration */}
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-primary-900 dark:text-primary-200 mb-3">
                  API Configuration
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      API URL
                    </label>
                    <input
                      type="url"
                      value={selections.apiUrl}
                      onChange={(e) =>
                        setSelections({ ...selections, apiUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="https://your-api.supabase.co/functions/v1"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {import.meta.env.VITE_SUPABASE_URL
                        ? "Pre-filled from environment"
                        : "Enter your Supabase Functions URL"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      API Key (Anon Key)
                    </label>
                    <input
                      type="password"
                      value={selections.apiKey}
                      onChange={(e) =>
                        setSelections({ ...selections, apiKey: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="Enter your Supabase anon key"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {import.meta.env.VITE_SUPABASE_ANON_KEY
                        ? "Pre-filled from environment"
                        : "Your Supabase anonymous key for client-side requests"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Installation Code */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {steps[3].title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Copy this code and add it to your project
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {frameworks.find((f) => f.id === selections.framework)
                    ?.type === "template"
                    ? "React Component Code"
                    : "HTML Script Tag"}
                </h3>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyCode}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {copiedCode ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copiedCode ? "Copied!" : "Copy Code"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const blob = new Blob([generateCode()], {
                        type: "text/plain",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download =
                        frameworks.find((f) => f.id === selections.framework)
                          ?.type === "template"
                          ? "ChatbotIntegration.tsx"
                          : "chatbot-script.html";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </motion.button>
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 text-sm text-gray-100 font-mono overflow-x-auto">
                <pre>{generateCode()}</pre>
              </div>
            </div>
            {/* Selected Chatbot Info */}
            {selections.botId && (
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
                <div className="flex items-start">
                  <Bot className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-primary-900 dark:text-primary-200">
                      Selected Chatbot
                    </h4>
                    {(() => {
                      const selectedBot = chatbots.find(
                        (bot) => bot.id === selections.botId
                      );
                      return selectedBot ? (
                        <div className="mt-1">
                          <p className="text-sm text-primary-800 dark:text-primary-300 font-medium">
                            {selectedBot.name}
                          </p>
                          <p className="text-sm text-primary-700 dark:text-primary-400">
                            {selectedBot.description}
                          </p>
                          <p className="text-xs text-primary-600 dark:text-primary-500 mt-1">
                            ID: {selectedBot.id}
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            )}
            {/* Next Steps */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
              <h4 className="text-lg font-medium text-green-900 dark:text-green-200 mb-3">
                Next Steps
              </h4>
              <ol className="text-sm text-green-800 dark:text-green-300 space-y-2">
                {frameworks.find((f) => f.id === selections.framework)?.type ===
                "template" ? (
                  <>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        1
                      </span>
                      <div>
                        <strong>Download template files:</strong> Get the
                        template components from the gallery
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        2
                      </span>
                      <div>
                        <strong>Install dependencies:</strong>{" "}
                        <code className="bg-green-100 dark:bg-green-900/50 px-1 rounded">
                          npm install lucide-react
                        </code>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        3
                      </span>
                      <div>
                        <strong>Add the code:</strong> Copy the generated code
                        to your React component
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        4
                      </span>
                      <div>
                        <strong>Test integration:</strong> Your chatbot is ready
                        to use!
                      </div>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        1
                      </span>
                      <div>
                        <strong>Host the widget:</strong> Upload
                        chatbot-widget.js to your server
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        2
                      </span>
                      <div>
                        <strong>Add script tag:</strong> Copy the generated
                        script tag to your HTML
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        3
                      </span>
                      <div>
                        <strong>Test integration:</strong> Your chatbot should
                        appear and function correctly
                      </div>
                    </li>
                  </>
                )}
              </ol>
            </div>
            {/* Additional Resources */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-center"
              >
                <Link to="/templates" className="block">
                  <Palette className="h-6 w-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Template Gallery
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Browse all templates
                  </p>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-center"
              >
                <Link to="/integrations" className="block">
                  <Code className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Documentation
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Complete setup guide
                  </p>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-center"
              >
                <Link to="/chatbots" className="block">
                  <Settings className="h-6 w-6 text-accent-600 dark:text-accent-400 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Manage Chatbots
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View & edit chatbots
                  </p>
                </Link>
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </motion.button>
        {currentStep < steps.length - 1 ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 dark:bg-primary-500 border border-transparent rounded-xl hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentStep(0)}
            className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-green-600 dark:bg-green-500 border border-transparent rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
          >
            Start Over
            <Zap className="h-4 w-4 ml-2" />
          </motion.button>
        )}
      </div>
    </div>
  );
};
