import React, { useState } from 'react'
import { 
  Webhook, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  CheckCircle, 
  XCircle,
  Clock,
  Settings,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useChatbots } from '../hooks/useChatbots'
import { 
  useWebhooks, 
  useCreateWebhook, 
  useUpdateWebhook, 
  useDeleteWebhook, 
  useTestWebhook,
  Webhook as WebhookType
} from '../hooks/useWebhooks'

export const WebhookManager = () => {
  const { user } = useAuth()
  const { data: chatbots = [] } = useChatbots(user?.id || '')
  const { data: webhooks = [], isLoading } = useWebhooks(user?.id || '')
  
  const createWebhook = useCreateWebhook()
  const updateWebhook = useUpdateWebhook()
  const deleteWebhook = useDeleteWebhook()
  const testWebhook = useTestWebhook()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<WebhookType | null>(null)
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({})
  const [copiedSecret, setCopiedSecret] = useState<string | null>(null)

  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    chatbot_id: '',
    events: [] as string[],
    secret: '',
    active: true
  })

  const availableEvents = [
    'message_received',
    'conversation_started',
    'conversation_ended',
    'chatbot_created',
    'chatbot_updated',
    'knowledge_base_updated'
  ]

  const handleCreateWebhook = async () => {
    if (!user?.id || !newWebhook.name || !newWebhook.url) return

    try {
      await createWebhook.mutateAsync({
        user_id: user.id,
        chatbot_id: newWebhook.chatbot_id || undefined,
        name: newWebhook.name,
        url: newWebhook.url,
        events: newWebhook.events,
        secret: newWebhook.secret || undefined,
        active: newWebhook.active
      })

      setShowCreateModal(false)
      setNewWebhook({
        name: '',
        url: '',
        chatbot_id: '',
        events: [],
        secret: '',
        active: true
      })
    } catch (error) {
      console.error('Failed to create webhook:', error)
      alert('Failed to create webhook. Please try again.')
    }
  }

  const handleUpdateWebhook = async () => {
    if (!editingWebhook) return

    try {
      await updateWebhook.mutateAsync({
        id: editingWebhook.id,
        updates: {
          name: editingWebhook.name,
          url: editingWebhook.url,
          events: editingWebhook.events,
          secret: editingWebhook.secret,
          active: editingWebhook.active
        }
      })

      setEditingWebhook(null)
    } catch (error) {
      console.error('Failed to update webhook:', error)
      alert('Failed to update webhook. Please try again.')
    }
  }

  const handleDeleteWebhook = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the webhook "${name}"?`)) {
      try {
        await deleteWebhook.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete webhook:', error)
        alert('Failed to delete webhook. Please try again.')
      }
    }
  }

  const handleTestWebhook = async (id: string) => {
    try {
      const result = await testWebhook.mutateAsync(id)
      
      const statusText = result.success ? 'Success' : 'Failed'
      const message = `Webhook Test ${statusText}\n\nStatus: ${result.status}\nResponse Time: ${result.response_time}ms\n\nResponse: ${result.response_body}`
      
      alert(message)
    } catch (error) {
      console.error('Webhook test failed:', error)
      alert('Webhook test failed. Please check the URL and try again.')
    }
  }

  const toggleSecret = (webhookId: string) => {
    setShowSecret(prev => ({
      ...prev,
      [webhookId]: !prev[webhookId]
    }))
  }

  const copySecret = (secret: string, webhookId: string) => {
    navigator.clipboard.writeText(secret)
    setCopiedSecret(webhookId)
    setTimeout(() => setCopiedSecret(null), 2000)
  }

  const toggleEvent = (event: string, isEditing = false) => {
    if (isEditing && editingWebhook) {
      const events = editingWebhook.events.includes(event)
        ? editingWebhook.events.filter(e => e !== event)
        : [...editingWebhook.events, event]
      
      setEditingWebhook({ ...editingWebhook, events })
    } else {
      const events = newWebhook.events.includes(event)
        ? newWebhook.events.filter(e => e !== event)
        : [...newWebhook.events, event]
      
      setNewWebhook({ ...newWebhook, events })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Webhook Management</h2>
          <p className="text-gray-600">Configure webhooks to receive real-time notifications</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Webhook
        </button>
      </div>

      {/* Webhooks List */}
      {webhooks.length === 0 ? (
        <div className="text-center py-12">
          <Webhook className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No Webhooks</h3>
          <p className="text-gray-500 mb-6">Create your first webhook to receive real-time notifications.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Webhook
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Webhook className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{webhook.name}</h3>
                    <p className="text-sm text-gray-500">{webhook.url}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    webhook.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {webhook.active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => handleTestWebhook(webhook.id)}
                    disabled={testWebhook.isPending}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingWebhook(webhook)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteWebhook(webhook.id, webhook.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Events</label>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <span key={event} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statistics</label>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {webhook.success_count}
                    </div>
                    <div className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      {webhook.failure_count}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Triggered</label>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {webhook.last_triggered_at 
                      ? new Date(webhook.last_triggered_at).toLocaleString()
                      : 'Never'
                    }
                  </div>
                </div>
              </div>

              {webhook.secret && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type={showSecret[webhook.id] ? 'text' : 'password'}
                      value={webhook.secret}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                    />
                    <button
                      onClick={() => toggleSecret(webhook.id)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {showSecret[webhook.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => copySecret(webhook.secret!, webhook.id)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {copiedSecret === webhook.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Webhook Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Create Webhook</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="My Webhook"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chatbot (Optional)</label>
                  <select
                    value={newWebhook.chatbot_id}
                    onChange={(e) => setNewWebhook({ ...newWebhook, chatbot_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Chatbots</option>
                    {chatbots.filter(bot => bot.status === 'ready').map(bot => (
                      <option key={bot.id} value={bot.id}>{bot.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                <input
                  type="url"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://your-app.com/webhook"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Events</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableEvents.map((event) => (
                    <label key={event} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newWebhook.events.includes(event)}
                        onChange={() => toggleEvent(event)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secret (Optional)</label>
                <input
                  type="text"
                  value={newWebhook.secret}
                  onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="webhook-secret-key"
                />
                <p className="text-sm text-gray-500 mt-1">Used to verify webhook authenticity</p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={newWebhook.active}
                  onChange={(e) => setNewWebhook({ ...newWebhook, active: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">Active</label>
              </div>
            </div>
            <div className="px-8 py-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWebhook}
                disabled={!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0 || createWebhook.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {createWebhook.isPending ? 'Creating...' : 'Create Webhook'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Webhook Modal */}
      {editingWebhook && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Webhook</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editingWebhook.name}
                    onChange={(e) => setEditingWebhook({ ...editingWebhook, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editingWebhook.active ? 'active' : 'inactive'}
                    onChange={(e) => setEditingWebhook({ ...editingWebhook, active: e.target.value === 'active' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                <input
                  type="url"
                  value={editingWebhook.url}
                  onChange={(e) => setEditingWebhook({ ...editingWebhook, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Events</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableEvents.map((event) => (
                    <label key={event} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingWebhook.events.includes(event)}
                        onChange={() => toggleEvent(event, true)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secret</label>
                <input
                  type="text"
                  value={editingWebhook.secret || ''}
                  onChange={(e) => setEditingWebhook({ ...editingWebhook, secret: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="webhook-secret-key"
                />
              </div>
            </div>
            <div className="px-8 py-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={() => setEditingWebhook(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateWebhook}
                disabled={!editingWebhook.name || !editingWebhook.url || editingWebhook.events.length === 0 || updateWebhook.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {updateWebhook.isPending ? 'Updating...' : 'Update Webhook'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}