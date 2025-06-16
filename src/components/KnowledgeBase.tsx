import React, { useState } from 'react'
import { FileText, Upload, Plus, Trash2, Search, Filter } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useChatbots } from '../hooks/useChatbots'
import { useKnowledgeBase, useAddKnowledgeBase, useDeleteKnowledgeBase } from '../hooks/useKnowledgeBase'

export const KnowledgeBase = () => {
  const { user } = useAuth()
  const { data: chatbots = [] } = useChatbots(user?.id || '')
  const [selectedChatbot, setSelectedChatbot] = useState<string>('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'text' | 'document'>('all')

  const { data: knowledgeBase = [], isLoading } = useKnowledgeBase(selectedChatbot)
  const addKnowledgeBase = useAddKnowledgeBase()
  const deleteKnowledgeBase = useDeleteKnowledgeBase()

  const [newContent, setNewContent] = useState({
    content: '',
    contentType: 'text' as 'text' | 'document',
    filename: ''
  })

  const filteredKnowledge = knowledgeBase.filter(item => {
    const matchesSearch = item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.filename && item.filename.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterType === 'all' || item.content_type === filterType
    return matchesSearch && matchesFilter
  })

  const handleAddKnowledge = async () => {
    if (!selectedChatbot || !newContent.content.trim()) return

    try {
      await addKnowledgeBase.mutateAsync({
        chatbot_id: selectedChatbot,
        content: newContent.content,
        content_type: newContent.contentType,
        filename: newContent.filename || null,
        processed: false
      })

      setNewContent({ content: '', contentType: 'text', filename: '' })
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding knowledge base:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this knowledge base item?')) {
      try {
        await deleteKnowledgeBase.mutateAsync(id)
      } catch (error) {
        console.error('Error deleting knowledge base:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600">Manage the content that powers your chatbots.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={!selectedChatbot}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </button>
      </div>

      {/* Chatbot Selection */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Chatbot</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chatbots.map((chatbot) => (
            <button
              key={chatbot.id}
              onClick={() => setSelectedChatbot(chatbot.id)}
              className={`p-4 border rounded-lg text-left transition-colors duration-200 ${
                selectedChatbot === chatbot.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{chatbot.name}</p>
                  <p className="text-sm text-gray-500">{chatbot.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        {chatbots.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No chatbots found</h3>
            <p className="text-gray-500">Create a chatbot first to manage its knowledge base.</p>
          </div>
        )}
      </div>

      {/* Knowledge Base Content */}
      {selectedChatbot && (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Knowledge Base Items</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="text">Text</option>
                  <option value="document">Document</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content List */}
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading knowledge base...</p>
              </div>
            ) : filteredKnowledge.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  {searchTerm || filterType !== 'all' ? 'No matching items' : 'No knowledge base items'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Add content to help your chatbot answer questions.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredKnowledge.map((item) => (
                  <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {item.filename || `${item.content_type} content`}
                        </span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.content_type === 'text' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {item.content_type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.processed 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.processed ? 'Processed' : 'Processing'}
                        </span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {item.content.substring(0, 200)}...
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Added {new Date(item.created_at).toLocaleDateString()}</span>
                      <span>{item.content.length} characters</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add Knowledge Base Content</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  value={newContent.contentType}
                  onChange={(e) => setNewContent({ ...newContent, contentType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="text">Text Content</option>
                  <option value="document">Document</option>
                </select>
              </div>

              {newContent.contentType === 'document' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filename (optional)
                  </label>
                  <input
                    type="text"
                    value={newContent.filename}
                    onChange={(e) => setNewContent({ ...newContent, filename: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="document.pdf"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newContent.content}
                  onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Paste your content here..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddKnowledge}
                disabled={!newContent.content.trim() || addKnowledgeBase.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {addKnowledgeBase.isPending ? 'Adding...' : 'Add Content'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}