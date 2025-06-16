import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Upload, FileText, Loader, CheckCircle, Zap, Brain } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useCreateChatbot } from '../hooks/useChatbots'
import { useAddKnowledgeBase } from '../hooks/useKnowledgeBase'
import { useTrainChatbot } from '../hooks/useTraining'

export const ChatbotBuilder = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const createChatbot = useCreateChatbot()
  const addKnowledgeBase = useAddKnowledgeBase()
  const trainChatbot = useTrainChatbot()
  
  const [step, setStep] = useState(1)
  const [createdChatbotId, setCreatedChatbotId] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    knowledgeBase: '',
    knowledgeBaseType: 'text' as 'text' | 'document',
    useOpenAI: true,
    openAIModel: 'gpt-3.5-turbo'
  })

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    try {
      // Create chatbot
      const chatbot = await createChatbot.mutateAsync({
        name: formData.name,
        description: formData.description,
        user_id: user.id,
        status: 'creating'
      })

      setCreatedChatbotId(chatbot.id)

      // Add knowledge base
      if (formData.knowledgeBase) {
        await addKnowledgeBase.mutateAsync({
          chatbot_id: chatbot.id,
          content: formData.knowledgeBase,
          content_type: formData.knowledgeBaseType,
          processed: false
        })
      }

      setStep(3) // Move to processing step

      // Start training with OpenAI
      if (formData.useOpenAI) {
        await trainChatbot.mutateAsync({
          chatbotId: chatbot.id,
          model: formData.openAIModel
        })
      }

      setStep(4) // Move to training step
      
      // Simulate final processing
      setTimeout(() => {
        setStep(5) // Move to completion step
      }, 3000)

    } catch (error) {
      console.error('Error creating chatbot:', error)
    }
  }

  const handleFinish = () => {
    navigate(`/chatbots/${createdChatbotId}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Step {step} of 5</span>
          <span className="text-sm text-gray-500">{Math.round((step / 5) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <Bot className="h-12 w-12 text-blue-600 mx-auto" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Create Your Chatbot</h2>
              <p className="mt-2 text-gray-600">Let's start by giving your chatbot a name and description.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chatbot Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Customer Support Bot"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what your chatbot will help with..."
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-blue-600 mx-auto" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Add Knowledge Base</h2>
              <p className="mt-2 text-gray-600">Upload documents or add text that your chatbot will use to answer questions.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Training Options
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="useOpenAI"
                      checked={formData.useOpenAI}
                      onChange={(e) => setFormData({ ...formData, useOpenAI: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="useOpenAI" className="ml-2 text-sm font-medium text-blue-900">
                      Use OpenAI for advanced training
                    </label>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Enable AI-powered training for better responses and understanding
                  </p>
                </div>
              </div>

              {formData.useOpenAI && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Model
                  </label>
                  <select
                    value={formData.openAIModel}
                    onChange={(e) => setFormData({ ...formData, openAIModel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Recommended)</option>
                    <option value="gpt-4">GPT-4 (Advanced)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo (Latest)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Knowledge Base Content
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-4">
                      Upload documents or paste your content below
                    </p>
                    <textarea
                      value={formData.knowledgeBase}
                      onChange={(e) => setFormData({ ...formData, knowledgeBase: e.target.value })}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Paste your knowledge base content here..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <Loader className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Processing Knowledge Base</h2>
              <p className="mt-2 text-gray-600">Analyzing and indexing your content for optimal performance.</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-sm text-blue-800">Processing your knowledge base...</span>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <Brain className="h-12 w-12 text-purple-600 mx-auto animate-pulse" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">AI Training in Progress</h2>
              <p className="mt-2 text-gray-600">Training your chatbot with OpenAI for intelligent responses.</p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                  <span className="text-sm text-green-800">Knowledge base processed ✓</span>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-3"></div>
                  <span className="text-sm text-purple-800">Training AI model with {formData.openAIModel}...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Chatbot Created Successfully!</h2>
              <p className="mt-2 text-gray-600">Your AI-powered chatbot is ready to use and has been trained with OpenAI.</p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Chatbot "{formData.name}" is ready!</p>
                    <p className="text-sm text-green-700">AI training completed with {formData.openAIModel}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Public chat URL generated</p>
                    <p className="text-sm text-blue-700 font-mono">
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          
          {step < 3 && (
            <button
              onClick={step === 2 ? handleSubmit : handleNext}
              disabled={
                (step === 1 && (!formData.name || !formData.description)) ||
                (step === 2 && !formData.knowledgeBase) ||
                createChatbot.isPending
              }
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 2 ? 'Create & Train Chatbot' : 'Next'}
            </button>
          )}
          
          {step === 5 && (
            <button
              onClick={handleFinish}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700"
            >
              View Chatbot
            </button>
          )}
        </div>
      </div>
    </div>
  )
}