import React from 'react'
import { Bot, Plus, MessageCircle, Settings, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useChatbots } from '../hooks/useChatbots'

export const ChatbotList = () => {
  const { user } = useAuth()
  const { data: chatbots = [], isLoading } = useChatbots(user?.id || '')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chatbots</h1>
          <p className="text-gray-600">Manage and create your AI-powered chatbots.</p>
        </div>
        <Link
          to="/chatbots/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chatbot
        </Link>
      </div>

      {/* Chatbots Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading chatbots...</p>
        </div>
      ) : chatbots.length === 0 ? (
        <div className="text-center py-12">
          <Bot className="h-16 w-16 text-gray-400 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No chatbots yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating your first AI-powered chatbot.
          </p>
          <div className="mt-6">
            <Link
              to="/chatbots/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Chatbot
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chatbots.map((chatbot) => (
            <div key={chatbot.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Bot className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">{chatbot.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        chatbot.status === 'ready' 
                          ? 'bg-green-100 text-green-800'
                          : chatbot.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {chatbot.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{chatbot.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Created {new Date(chatbot.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    0 messages
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    to={`/chatbots/${chatbot.id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  >
                    View
                  </Link>
                  <Link
                    to={`/chatbots/${chatbot.id}/settings`}
                    className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                  <button className="flex items-center justify-center px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}