import { useState } from "react";
import { Bot, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { categories, templates } from "./utils/helpers";

export const ChatTemplateShowcase = () => {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [position, setPosition] = useState<
    "bottom-right" | "bottom-left" | "center"
  >("bottom-right");

  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTemplates =
    selectedCategory === "All"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const renderActiveTemplate = () => {
    const template = templates.find((t) => t.id === activeTemplate);
    if (!template) return null;

    const Component = template.component;
    return (
      <Component
        botId="demo-bot"
        apiUrl="/api"
        isOpen={true}
        onToggle={() => setActiveTemplate(null)}
        theme={theme}
      />
    );
  };

  return (
    <div className="space-y-10 px-4 md:px-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Chat Template Gallery
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Explore our comprehensive collection of beautiful, production-ready
          chat templates. Each template is fully customizable and designed for
          specific industries and use cases.
        </p>
      </motion.div>

      {/* Category Filter */}
      <div className="flex justify-center">
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedCategory === category
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Preview Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as "light" | "dark")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Position
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="center">Center</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setActiveTemplate(null)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className={`h-32 ${template.preview} relative`}>
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div className="absolute top-2 right-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    template.category === "General"
                      ? "bg-blue-100 text-blue-800"
                      : template.category === "Business"
                      ? "bg-gray-100 text-gray-800"
                      : template.category === "Industry"
                      ? "bg-green-100 text-green-800"
                      : template.category === "Entertainment"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {template.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {template.description}
              </p>
              <div className="space-y-2 mb-4">
                {template.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    {feature}
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTemplate(template.id)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Preview
                </button>
                <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Settings className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Active Template */}
      {renderActiveTemplate()}
    </div>
  );
};
