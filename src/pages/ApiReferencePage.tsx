import React, { useState } from "react";
import {
  Code,
  Copy,
  Check,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

const ApiReferencePage: React.FC = () => {
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(
    "chatbots-list"
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string>("chatbots");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleCategory = (category: string) => {
    if (expandedCategory === category) {
      setExpandedCategory("");
    } else {
      setExpandedCategory(category);
    }
  };

  const categories = [
    {
      id: "chatbots",
      name: "Chatbots",
      endpoints: [
        {
          id: "chatbots-list",
          method: "GET",
          path: "/api/chatbots",
          description: "List all chatbots",
          request: `curl -X GET "https://api.chatterwise.io/api/chatbots" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          response: `{
  "success": true,
  "data": [
    {
      "id": "cb_123456789",
      "name": "Customer Support Bot",
      "description": "Handles customer inquiries",
      "status": "ready",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    },
    {
      "id": "cb_987654321",
      "name": "Sales Assistant",
      "description": "Helps with product information and sales",
      "status": "ready",
      "created_at": "2025-01-10T14:20:00Z",
      "updated_at": "2025-01-12T09:15:00Z"
    }
  ]
}`,
        },
        {
          id: "chatbots-get",
          method: "GET",
          path: "/api/chatbots/:id",
          description: "Get a specific chatbot",
          request: `curl -X GET "https://api.chatterwise.io/api/chatbots/cb_123456789" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          response: `{
  "success": true,
  "data": {
    "id": "cb_123456789",
    "name": "Customer Support Bot",
    "description": "Handles customer inquiries",
    "status": "ready",
    "knowledge_base_processed": true,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}`,
        },
        {
          id: "chatbots-create",
          method: "POST",
          path: "/api/chatbots",
          description: "Create a new chatbot",
          request: `curl -X POST "https://api.chatterwise.io/api/chatbots" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "New Support Bot",
    "description": "A bot for handling support tickets"
  }'`,
          response: `{
  "success": true,
  "data": {
    "id": "cb_new12345",
    "name": "New Support Bot",
    "description": "A bot for handling support tickets",
    "status": "creating",
    "created_at": "2025-02-20T15:30:00Z",
    "updated_at": "2025-02-20T15:30:00Z"
  }
}`,
        },
      ],
    },
    {
      id: "chat",
      name: "Chat",
      endpoints: [
        {
          id: "chat-send",
          method: "POST",
          path: "/api/chat",
          description: "Send a message to a chatbot",
          request: `curl -X POST "https://api.chatterwise.io/api/chat" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "chatbot_id": "cb_123456789",
    "message": "How do I reset my password?",
    "user_id": "optional-user-identifier"
  }'`,
          response: `{
  "success": true,
  "data": {
    "id": "msg_123456",
    "chatbot_id": "cb_123456789",
    "message": "How do I reset my password?",
    "response": "To reset your password, please go to the login page and click on the 'Forgot Password' link. You'll receive an email with instructions to create a new password.",
    "created_at": "2025-02-20T15:35:00Z"
  }
}`,
        },
        {
          id: "chat-history",
          method: "GET",
          path: "/api/chat/:chatbot_id/history",
          description: "Get chat history for a chatbot",
          request: `curl -X GET "https://api.chatterwise.io/api/chat/cb_123456789/history" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          response: `{
  "success": true,
  "data": [
    {
      "id": "msg_123456",
      "chatbot_id": "cb_123456789",
      "message": "How do I reset my password?",
      "response": "To reset your password, please go to the login page and click on the 'Forgot Password' link. You'll receive an email with instructions to create a new password.",
      "created_at": "2025-02-20T15:35:00Z"
    },
    {
      "id": "msg_123457",
      "chatbot_id": "cb_123456789",
      "message": "Where can I find my invoice?",
      "response": "You can find your invoices in the account section under 'Billing History'. All your past invoices are available for download in PDF format.",
      "created_at": "2025-02-20T15:40:00Z"
    }
  ]
}`,
        },
      ],
    },
    {
      id: "knowledge",
      name: "Knowledge Base",
      endpoints: [
        {
          id: "knowledge-list",
          method: "GET",
          path: "/api/knowledge/:chatbot_id",
          description: "List knowledge base items for a chatbot",
          request: `curl -X GET "https://api.chatterwise.io/api/knowledge/cb_123456789" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          response: `{
  "success": true,
  "data": [
    {
      "id": "kb_123456",
      "chatbot_id": "cb_123456789",
      "content_type": "text",
      "filename": "faq.txt",
      "processed": true,
      "created_at": "2025-02-15T10:30:00Z"
    },
    {
      "id": "kb_123457",
      "chatbot_id": "cb_123456789",
      "content_type": "document",
      "filename": "product_manual.pdf",
      "processed": true,
      "created_at": "2025-02-16T14:20:00Z"
    }
  ]
}`,
        },
        {
          id: "knowledge-add",
          method: "POST",
          path: "/api/knowledge",
          description: "Add content to knowledge base",
          request: `curl -X POST "https://api.chatterwise.io/api/knowledge" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "chatbot_id": "cb_123456789",
    "content": "Our business hours are 9 AM to 5 PM EST, Monday through Friday.",
    "content_type": "text",
    "filename": "business_hours.txt"
  }'`,
          response: `{
  "success": true,
  "data": {
    "id": "kb_new12345",
    "chatbot_id": "cb_123456789",
    "content_type": "text",
    "filename": "business_hours.txt",
    "processed": false,
    "created_at": "2025-02-20T15:45:00Z"
  }
}`,
        },
      ],
    },
    {
      id: "analytics",
      name: "Analytics",
      endpoints: [
        {
          id: "analytics-get",
          method: "GET",
          path: "/api/analytics/:chatbot_id",
          description: "Get analytics for a chatbot",
          request: `curl -X GET "https://api.chatterwise.io/api/analytics/cb_123456789?period=30d" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          response: `{
  "success": true,
  "data": {
    "total_messages": 1247,
    "unique_users": 342,
    "avg_response_time": 850,
    "satisfaction_rate": 87,
    "period": "30d",
    "daily_stats": [
      {
        "date": "2025-02-01",
        "messages": 45,
        "users": 23
      },
      {
        "date": "2025-02-02",
        "messages": 52,
        "users": 28
      }
    ]
  }
}`,
        },
      ],
    },
  ];

  const selectedEndpoint = categories
    .flatMap((category) => category.endpoints)
    .find((endpoint) => endpoint.id === activeEndpoint);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            API Reference
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive documentation for the ChatterWise API
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search API endpoints..."
              className="w-full pl-12 pr-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Endpoints
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="mb-2">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="flex items-center justify-between w-full p-2 text-left font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <span>{category.name}</span>
                      {expandedCategory === category.id ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    {expandedCategory === category.id && (
                      <div className="mt-1 ml-2 space-y-1">
                        {category.endpoints.map((endpoint) => (
                          <button
                            key={endpoint.id}
                            onClick={() => setActiveEndpoint(endpoint.id)}
                            className={`w-full p-2 text-left text-sm rounded-lg transition-colors ${
                              activeEndpoint === endpoint.id
                                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            <span
                              className={`inline-block w-14 mr-2 px-2 py-1 text-xs rounded-full text-center ${
                                endpoint.method === "GET"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                  : endpoint.method === "POST"
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                  : endpoint.method === "PUT"
                                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                              }`}
                            >
                              {endpoint.method}
                            </span>
                            {endpoint.path.split("/").pop()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-3"
          >
            {selectedEndpoint ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center">
                      <span
                        className={`inline-block px-3 py-1 text-sm rounded-lg font-medium mr-3 ${
                          selectedEndpoint.method === "GET"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : selectedEndpoint.method === "POST"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                            : selectedEndpoint.method === "PUT"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                        }`}
                      >
                        {selectedEndpoint.method}
                      </span>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedEndpoint.path}
                      </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                      {selectedEndpoint.description}
                    </p>
                  </div>
                  <a
                    href="#"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Try it
                  </a>
                </div>

                <div className="space-y-6">
                  {/* Request */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Request
                      </h3>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            selectedEndpoint.request,
                            `request-${selectedEndpoint.id}`
                          )
                        }
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center text-sm"
                      >
                        {copiedCode === `request-${selectedEndpoint.id}` ? (
                          <Check className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        {copiedCode === `request-${selectedEndpoint.id}`
                          ? "Copied!"
                          : "Copy"}
                      </button>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-gray-100 text-sm font-mono">
                        {selectedEndpoint.request}
                      </pre>
                    </div>
                  </div>

                  {/* Response */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Response
                      </h3>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            selectedEndpoint.response,
                            `response-${selectedEndpoint.id}`
                          )
                        }
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center text-sm"
                      >
                        {copiedCode === `response-${selectedEndpoint.id}` ? (
                          <Check className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        {copiedCode === `response-${selectedEndpoint.id}`
                          ? "Copied!"
                          : "Copy"}
                      </button>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-gray-100 text-sm font-mono">
                        {selectedEndpoint.response}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 text-center">
                <Code className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select an API Endpoint
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose an endpoint from the sidebar to view its documentation
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ApiReferencePage;
