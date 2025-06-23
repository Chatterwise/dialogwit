import { useState } from "react";
import {
  Play,
  RotateCcw,
  MessageCircle,
  Bot,
  User,
  Settings,
  Activity,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useChatbots } from "../hooks/useChatbots";
import {
  useTestScenarios,
  useCreateTestScenario,
  useUpdateTestScenario,
  useDeleteTestScenario,
  useRunTestScenario,
  TestScenario,
  TestMessage,
} from "../hooks/useTestScenarios";
import {
  useStagingDeployments,
  useCreateStagingDeployment,
  useDeleteStagingDeployment,
  useRunHealthCheck,
} from "../hooks/useStagingEnvironment";

export const TestingTools = () => {
  const { user } = useAuth();
  const { data: chatbots = [] } = useChatbots(user?.id || "");
  const [selectedChatbot, setSelectedChatbot] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "simulator" | "scenarios" | "staging"
  >("simulator");

  // Test scenarios state
  const { data: testScenarios = [] } = useTestScenarios(
    user?.id || "",
    selectedChatbot
  );
  const createTestScenario = useCreateTestScenario();
  const updateTestScenario = useUpdateTestScenario();
  const deleteTestScenario = useDeleteTestScenario();
  const runTestScenario = useRunTestScenario();

  // Staging environment state
  const { data: stagingDeployments = [] } = useStagingDeployments(
    user?.id || ""
  );
  const createStagingDeployment = useCreateStagingDeployment();
  const deleteStagingDeployment = useDeleteStagingDeployment();
  const runHealthCheck = useRunHealthCheck();

  // Local state
  const [conversationSimulator, setConversationSimulator] = useState({
    messages: [] as Array<{
      id: string;
      text: string;
      sender: "user" | "bot";
      timestamp: Date;
    }>,
    currentMessage: "",
    isTyping: false,
  });

  const [showCreateScenario, setShowCreateScenario] = useState(false);
  const [editingScenario, setEditingScenario] = useState<TestScenario | null>(
    null
  );
  const [newScenario, setNewScenario] = useState({
    name: "",
    description: "",
    messages: [{ message: "", expectedResponse: "" }],
  });

  const [showCreateDeployment, setShowCreateDeployment] = useState(false);
  const [newDeployment, setNewDeployment] = useState({
    name: "",
    description: "",
    config: {},
  });

  const sendSimulatorMessage = async () => {
    if (!conversationSimulator.currentMessage.trim() || !selectedChatbot)
      return;

    const userMessage = {
      id: Date.now().toString(),
      text: conversationSimulator.currentMessage,
      sender: "user" as const,
      timestamp: new Date(),
    };

    setConversationSimulator((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      currentMessage: "",
      isTyping: true,
    }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            botId: selectedChatbot,
            message: userMessage.text,
            userIp: "simulator",
          }),
        }
      );

      const data = await response.json();

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: "bot" as const,
        timestamp: new Date(),
      };

      setConversationSimulator((prev) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isTyping: false,
      }));
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Error: Failed to get response from chatbot",
        sender: "bot" as const,
        timestamp: new Date(),
      };

      setConversationSimulator((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isTyping: false,
      }));
    }
  };

  const handleCreateScenario = async () => {
    if (!user?.id || !selectedChatbot || !newScenario.name.trim()) return;

    const testMessages: TestMessage[] = newScenario.messages
      .filter((m) => m.message.trim())
      .map((m, index) => ({
        id: `msg-${index}`,
        message: m.message,
        expectedResponse: m.expectedResponse || undefined,
        status: "pending" as const,
      }));

    try {
      await createTestScenario.mutateAsync({
        user_id: user.id,
        chatbot_id: selectedChatbot,
        name: newScenario.name,
        description: newScenario.description,
        test_messages: testMessages,
        status: "draft",
      });

      setShowCreateScenario(false);
      setNewScenario({
        name: "",
        description: "",
        messages: [{ message: "", expectedResponse: "" }],
      });
    } catch (error) {
      console.error("Failed to create test scenario:", error);
      alert("Failed to create test scenario. Please try again.");
    }
  };

  const handleRunScenario = async (scenarioId: string) => {
    if (!selectedChatbot) return;

    try {
      await runTestScenario.mutateAsync({
        scenarioId,
        chatbotId: selectedChatbot,
      });
    } catch (error) {
      console.error("Failed to run test scenario:", error);
      alert("Failed to run test scenario. Please try again.");
    }
  };

  const handleCreateDeployment = async () => {
    if (!user?.id || !selectedChatbot || !newDeployment.name.trim()) return;

    try {
      await createStagingDeployment.mutateAsync({
        userId: user.id,
        chatbotId: selectedChatbot,
        name: newDeployment.name,
        description: newDeployment.description,
        config: {
          chatbot_id: selectedChatbot,
          environment: "staging",
          created_by: user.id,
          ...newDeployment.config,
        },
      });

      setShowCreateDeployment(false);
      setNewDeployment({
        name: "",
        description: "",
        config: {},
      });
    } catch (error) {
      console.error("Failed to create staging deployment:", error);
      alert("Failed to create staging deployment. Please try again.");
    }
  };

  const handleHealthCheck = async (deploymentId: string) => {
    try {
      const result = await runHealthCheck.mutateAsync(deploymentId);

      const statusText =
        result.status === "healthy"
          ? "All checks passed!"
          : result.status === "degraded"
          ? "Some warnings detected."
          : "Health check failed!";

      alert(
        `Health Check Complete: ${statusText}\n\nChecks:\n${result.checks
          .map((c) => `• ${c.name}: ${c.status.toUpperCase()} - ${c.message}`)
          .join("\n")}`
      );
    } catch (error) {
      console.error("Health check failed:", error);
      alert("Health check failed. Please try again.");
    }
  };

  const tabs = [
    { id: "simulator", name: "Conversation Simulator", icon: MessageCircle },
    { id: "scenarios", name: "Test Scenarios", icon: Play },
    { id: "staging", name: "Staging Environment", icon: Settings },
  ];

  const readyChatbots = chatbots.filter((bot) => bot.status === "ready");

  return (
    <div className="space-y-8 dark:bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight mb-1">
            Testing Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test and debug your chatbots in a controlled environment.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedChatbot}
            onChange={(e) => setSelectedChatbot(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select Chatbot</option>
            {readyChatbots.map((bot) => (
              <option key={bot.id} value={bot.id}>
                {bot.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <Icon className="h-4 w-4 mr-2 inline" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation Simulator */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 h-96 flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-primary-50 via-white to-accent-50 dark:from-primary-900/20 dark:via-gray-900/40 dark:to-accent-900/20 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Conversation Simulator
                  </h3>
                  <button
                    onClick={() =>
                      setConversationSimulator({
                        messages: [],
                        currentMessage: "",
                        isTyping: false,
                      })
                    }
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {conversationSimulator.messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Start a conversation to test your chatbot
                    </p>
                  </div>
                ) : (
                  conversationSimulator.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                          message.sender === "user"
                            ? "bg-primary-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        <div className="flex items-start">
                          {message.sender === "bot" && (
                            <Bot className="h-4 w-4 mr-2 mt-0.5 text-primary-600 dark:text-primary-400" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm">{message.text}</p>
                            <span className="text-xs opacity-75 mt-1 block">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          {message.sender === "user" && (
                            <User className="h-4 w-4 ml-2 mt-0.5 text-white/80" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {conversationSimulator.isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-xl">
                      <div className="flex items-center space-x-1">
                        <Bot className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        <div className="flex space-x-1 ml-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={conversationSimulator.currentMessage}
                    onChange={(e) =>
                      setConversationSimulator((prev) => ({
                        ...prev,
                        currentMessage: e.target.value,
                      }))
                    }
                    onKeyPress={(e) =>
                      e.key === "Enter" && sendSimulatorMessage()
                    }
                    placeholder="Type a test message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={
                      !selectedChatbot || conversationSimulator.isTyping
                    }
                  />
                  <button
                    onClick={sendSimulatorMessage}
                    disabled={
                      !selectedChatbot ||
                      !conversationSimulator.currentMessage.trim() ||
                      conversationSimulator.isTyping
                    }
                    className="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-xl hover:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Debug Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Debug Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected Chatbot
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedChatbot
                      ? readyChatbots.find((b) => b.id === selectedChatbot)
                          ?.name
                      : "None selected"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Messages Sent
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {
                      conversationSimulator.messages.filter(
                        (m) => m.sender === "user"
                      ).length
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Responses Received
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {
                      conversationSimulator.messages.filter(
                        (m) => m.sender === "bot"
                      ).length
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        conversationSimulator.isTyping
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    ></div>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {conversationSimulator.isTyping
                        ? "Bot is typing..."
                        : "Ready"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "scenarios" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Test Scenarios
            </h3>
            <button
              onClick={() => setShowCreateScenario(true)}
              disabled={!selectedChatbot}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Scenario
            </button>
          </div>

          {testScenarios.length === 0 ? (
            <div className="text-center py-12">
              <Play className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                No Test Scenarios
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create automated test scenarios to validate your chatbot's
                responses.
              </p>
              <button
                onClick={() => setShowCreateScenario(true)}
                disabled={!selectedChatbot}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Scenario
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {testScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {scenario.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {scenario.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          scenario.status === "active"
                            ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                            : scenario.status === "draft"
                            ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                            : "bg-gray-100 dark:bg-gray-700/30 text-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {scenario.status}
                      </span>
                      <button
                        onClick={() => handleRunScenario(scenario.id)}
                        disabled={!selectedChatbot || runTestScenario.isPending}
                        className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg disabled:opacity-50"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTestScenario.mutate(scenario.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Test Messages:</strong>{" "}
                      {scenario.test_messages.length}
                    </div>

                    {scenario.last_run_results && (
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Last Run Results
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Success Rate:
                            </span>
                            <span className="ml-1 font-medium">
                              {Math.round(
                                scenario.last_run_results.success_rate || 0
                              )}
                              %
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Avg Response:
                            </span>
                            <span className="ml-1 font-medium">
                              {Math.round(
                                scenario.last_run_results.avg_response_time || 0
                              )}
                              ms
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Passed:
                            </span>
                            <span className="ml-1 font-medium text-green-600 dark:text-green-400">
                              {scenario.last_run_results.passed_tests || 0}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Failed:
                            </span>
                            <span className="ml-1 font-medium text-red-600 dark:text-red-400">
                              {scenario.last_run_results.failed_tests || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {scenario.test_messages
                        .slice(0, 3)
                        .map((message, index) => (
                          <div
                            key={index}
                            className="text-xs bg-gray-50 dark:bg-gray-700/30 rounded p-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                Test {index + 1}
                              </span>
                              {message.status && (
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                    message.status === "passed"
                                      ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                                      : message.status === "failed"
                                      ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                                      : message.status === "running"
                                      ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                                      : "bg-gray-100 dark:bg-gray-700/30 text-gray-800 dark:text-gray-400"
                                  }`}
                                >
                                  {message.status}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              {message.message}
                            </p>
                          </div>
                        ))}
                      {scenario.test_messages.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 text-center">
                          +{scenario.test_messages.length - 3} more tests
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "staging" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Staging Environment
            </h3>
            <button
              onClick={() => setShowCreateDeployment(true)}
              disabled={!selectedChatbot}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Deployment
            </button>
          </div>

          {stagingDeployments.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                No Staging Deployments
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create staging deployments to test your chatbots in a
                production-like environment.
              </p>
              <button
                onClick={() => setShowCreateDeployment(true)}
                disabled={!selectedChatbot}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Staging Deployment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {stagingDeployments.map((deployment) => (
                <div
                  key={deployment.id}
                  className="bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {deployment.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {deployment.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          deployment.status === "ready"
                            ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                            : deployment.status === "deploying"
                            ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                            : deployment.status === "error"
                            ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                            : "bg-gray-100 dark:bg-gray-700/30 text-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {deployment.status}
                      </span>
                      <button
                        onClick={() =>
                          deleteStagingDeployment.mutate(deployment.id)
                        }
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {deployment.url && (
                    <div className="mb-4">
                      <a
                        href={deployment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        {deployment.url}
                      </a>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={() => handleHealthCheck(deployment.id)}
                      disabled={runHealthCheck.isPending}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      {runHealthCheck.isPending
                        ? "Running Health Check..."
                        : "Run Health Check"}
                    </button>

                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      <div>
                        Created:{" "}
                        {new Date(deployment.created_at).toLocaleString()}
                      </div>
                      <div>
                        Updated:{" "}
                        {new Date(deployment.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Scenario Modal */}
      {showCreateScenario && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-40 dark:bg-gray-900/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Create Test Scenario
              </h3>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scenario Name
                </label>
                <input
                  type="text"
                  value={newScenario.name}
                  onChange={(e) =>
                    setNewScenario({ ...newScenario, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Basic Greeting Flow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newScenario.description}
                  onChange={(e) =>
                    setNewScenario({
                      ...newScenario,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe what this scenario tests..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Messages
                </label>
                <div className="space-y-3">
                  {newScenario.messages.map((message, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Test Message
                          </label>
                          <input
                            type="text"
                            value={message.message}
                            onChange={(e) => {
                              const updated = [...newScenario.messages];
                              updated[index].message = e.target.value;
                              setNewScenario({
                                ...newScenario,
                                messages: updated,
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter test message..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Expected Response (optional)
                          </label>
                          <input
                            type="text"
                            value={message.expectedResponse}
                            onChange={(e) => {
                              const updated = [...newScenario.messages];
                              updated[index].expectedResponse = e.target.value;
                              setNewScenario({
                                ...newScenario,
                                messages: updated,
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Expected response keywords..."
                          />
                        </div>
                      </div>
                      {newScenario.messages.length > 1 && (
                        <button
                          onClick={() => {
                            const updated = newScenario.messages.filter(
                              (_, i) => i !== index
                            );
                            setNewScenario({
                              ...newScenario,
                              messages: updated,
                            });
                          }}
                          className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setNewScenario({
                        ...newScenario,
                        messages: [
                          ...newScenario.messages,
                          { message: "", expectedResponse: "" },
                        ],
                      });
                    }}
                    className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-gray-500 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    + Add Test Message
                  </button>
                </div>
              </div>
            </div>
            <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateScenario(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateScenario}
                disabled={
                  !newScenario.name.trim() || createTestScenario.isPending
                }
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 dark:bg-primary-700 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50"
              >
                {createTestScenario.isPending
                  ? "Creating..."
                  : "Create Scenario"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Deployment Modal */}
      {showCreateDeployment && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-40 dark:bg-gray-900/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full mx-4 border border-gray-100 dark:border-gray-700">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Create Staging Deployment
              </h3>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deployment Name
                </label>
                <input
                  type="text"
                  value={newDeployment.name}
                  onChange={(e) =>
                    setNewDeployment({ ...newDeployment, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Staging v1.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newDeployment.description}
                  onChange={(e) =>
                    setNewDeployment({
                      ...newDeployment,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe this deployment..."
                />
              </div>
            </div>
            <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateDeployment(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDeployment}
                disabled={
                  !newDeployment.name.trim() ||
                  createStagingDeployment.isPending
                }
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 dark:bg-primary-700 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50"
              >
                {createStagingDeployment.isPending
                  ? "Creating..."
                  : "Create Deployment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
