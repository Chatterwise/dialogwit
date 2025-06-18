import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Upload,
  FileText,
  CheckCircle,
  Zap,
  Brain,
  Database,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCreateChatbot } from "../hooks/useChatbots";
import { useAddKnowledgeBase } from "../hooks/useKnowledgeBase";
import { useTrainChatbot } from "../hooks/useTraining";
import { useUsageLimitCheck } from "./ChatbotLimitGuard";
import { useSubscriptionStatus } from "../hooks/useStripe";
import { useEmail } from "../hooks/useEmail";
import { Link } from "react-router-dom";

export const ChatbotBuilder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createChatbot = useCreateChatbot();
  const addKnowledgeBase = useAddKnowledgeBase();
  const trainChatbot = useTrainChatbot();
  const { checkLimit, isLoading: checkingLimits } = useUsageLimitCheck();
  const { hasActiveSubscription } = useSubscriptionStatus();
  const { sendNewChatbotEmail } = useEmail();

  const [step, setStep] = useState(1);
  const [createdChatbotId, setCreatedChatbotId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trainingData: "",
    trainingDataType: "text" as "text" | "document",
    useOpenAI: true,
    openAIModel: "gpt-3.5-turbo",
  });
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    const checkChatbotLimit = async () => {
      if (!user) return;
      try {
        const allowed = await checkLimit("chatbots");
        setLimitReached(!allowed);
      } catch (error) {
        console.error("Failed to check chatbot limit:", error);
      }
    };
    checkChatbotLimit();
  }, [user]);

  const handleNext = () => setStep(Math.min(step + 1, 5));
  const handleBack = () => setStep(Math.max(step - 1, 1));

  const handleSubmit = async () => {
    if (!user) return;
    try {
      const allowed = await checkLimit("chatbots");
      if (!allowed) {
        setLimitReached(true);
        return;
      }

      // Create chatbot
      const chatbot = await createChatbot.mutateAsync({
        name: formData.name,
        description: formData.description,
        user_id: user.id,
        status: "creating",
      });
      setCreatedChatbotId(chatbot.id);

      // Add training data
      if (formData.trainingData) {
        await addKnowledgeBase.mutateAsync({
          chatbot_id: chatbot.id,
          content: formData.trainingData,
          content_type: formData.trainingDataType,
          processed: false,
        });
      }

      setStep(3); // Move to processing step

      // Start RAG processing with OpenAI
      if (formData.useOpenAI) {
        await trainChatbot.mutateAsync({
          chatbotId: chatbot.id,
          model: formData.openAIModel,
        });
      }

      setStep(4); // Move to training step

      // Simulate final processing
      setTimeout(() => {
        setStep(5); // Completion step
        sendNewChatbotEmail.mutate({
          chatbotId: chatbot.id,
          chatbotName: formData.name,
        });
      }, 3000);
    } catch (error) {
      console.error("Error creating chatbot:", error);
    }
  };

  const handleFinish = () => navigate(`/chatbots/${createdChatbotId}`);

  if (limitReached) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mt-1 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                Chatbot Limit Reached
              </h3>
              <p className="text-red-700 dark:text-red-300 mt-1">
                You've reached the maximum number of chatbots allowed on your
                current plan.
              </p>
              <div className="mt-4">
                <Link
                  to="/pricing"
                  className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-card transition-colors duration-200"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Step {step} of 5
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round((step / 5) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
          <div
            className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <Bot className="h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100 font-display tracking-tight">
                Create Your Chatbot
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Let's start by giving your chatbot a name and description.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chatbot Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
                  placeholder="e.g., Customer Support Bot"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
                  placeholder="Describe what your chatbot will help with..."
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <FileText className="h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100 font-display tracking-tight">
                Add Bot Training Data
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Upload documents or add text that your chatbot will use to
                answer questions.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  RAG Processing Options
                </label>
                <div className="bg-primary-50/80 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="useOpenAI"
                      checked={formData.useOpenAI}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          useOpenAI: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-400 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="useOpenAI"
                      className="ml-2 text-sm font-medium text-primary-900 dark:text-primary-200"
                    >
                      Use OpenAI for RAG (Retrieval-Augmented Generation)
                    </label>
                  </div>
                  <p className="text-sm text-primary-700 dark:text-primary-300 mt-2">
                    Enable AI-powered chunking, embeddings, and semantic search
                    for better responses
                  </p>
                  <div className="mt-4 text-xs text-primary-600 dark:text-primary-300 space-y-2">
                    <div className="flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      <span>Automatic content chunking</span>
                    </div>
                    <div className="flex items-center">
                      <Brain className="h-4 w-4 mr-2" />
                      <span>Vector embeddings for semantic search</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      <span>Context-aware responses</span>
                    </div>
                  </div>
                </div>
              </div>

              {formData.useOpenAI && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    AI Model
                  </label>
                  <select
                    value={formData.openAIModel}
                    onChange={(e) =>
                      setFormData({ ...formData, openAIModel: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
                  >
                    <option value="gpt-3.5-turbo">
                      GPT-3.5 Turbo (Recommended)
                    </option>
                    <option value="gpt-4">GPT-4 (Advanced)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo (Latest)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bot Training Data Content
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center">
                  <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Upload documents or paste your content below
                  </p>
                  <textarea
                    value={formData.trainingData}
                    onChange={(e) =>
                      setFormData({ ...formData, trainingData: e.target.value })
                    }
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
                    placeholder="Paste your Bot Training Data content here..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <Database className="h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto animate-pulse" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100 font-display tracking-tight">
                Processing Bot Training Data
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Chunking content and creating vector embeddings for optimal
                retrieval.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-primary-50/80 dark:bg-primary-900/20 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 dark:border-primary-400 mr-3"></div>
                  <span className="text-sm text-primary-800 dark:text-primary-200">
                    Chunking content into optimal segments...
                  </span>
                </div>
              </div>
              <div className="bg-purple-50/80 dark:bg-purple-900/20 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 dark:border-purple-400 mr-3"></div>
                  <span className="text-sm text-purple-800 dark:text-purple-200">
                    Creating vector embeddings...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <div className="text-center">
              <Brain className="h-16 w-16 text-purple-600 dark:text-purple-400 mx-auto animate-pulse" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100 font-display tracking-tight">
                RAG Pipeline Processing
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Setting up retrieval-augmented generation for intelligent
                responses.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50/80 dark:bg-green-900/20 rounded-xl p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                  <span className="text-sm text-green-800 dark:text-green-200">
                    Content chunked successfully ✓
                  </span>
                </div>
              </div>
              <div className="bg-green-50/80 dark:bg-green-900/20 rounded-xl p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                  <span className="text-sm text-green-800 dark:text-green-200">
                    Vector embeddings created ✓
                  </span>
                </div>
              </div>
              <div className="bg-purple-50/80 dark:bg-purple-900/20 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 dark:border-purple-400 mr-3"></div>
                  <span className="text-sm text-purple-800 dark:text-purple-200">
                    Setting up semantic search with {formData.openAIModel}...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100 font-display tracking-tight">
                RAG Chatbot Ready!
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Your AI-powered chatbot with retrieval-augmented generation is
                ready to use.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50/80 dark:bg-green-900/20 rounded-xl p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Chatbot "{formData.name}" is ready!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      RAG pipeline configured with {formData.openAIModel}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-primary-50/80 dark:bg-primary-900/20 rounded-xl p-6">
                <div className="flex items-center">
                  <Database className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-primary-800 dark:text-primary-200">
                      Vector database ready
                    </p>
                    <p className="text-sm text-primary-700 dark:text-primary-300">
                      Content chunked and embedded for semantic search
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50/80 dark:bg-purple-900/20 rounded-xl p-6">
                <div className="flex items-center">
                  <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      Public chat URL generated
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300 font-mono">
                      {window.location.origin}/chat/{createdChatbotId}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </button>

          {step < 3 && (
            <button
              onClick={step === 2 ? handleSubmit : handleNext}
              disabled={
                (step === 1 && (!formData.name || !formData.description)) ||
                (step === 2 && !formData.trainingData) ||
                createChatbot.isPending ||
                checkingLimits
              }
              className="flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 dark:bg-primary-500 border border-transparent rounded-xl shadow-card hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {step === 2 ? "Create & Process RAG" : "Next"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          )}

          {step === 5 && (
            <button
              onClick={handleFinish}
              className="flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-green-600 dark:bg-green-500 border border-transparent rounded-xl shadow-card hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200"
            >
              View Chatbot
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
