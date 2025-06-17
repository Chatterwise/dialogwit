import React from 'react'
import { Mail, ExternalLink, Download } from 'lucide-react'

interface EmailPreviewProps {
  subject: string
  from?: string
  to?: string
  body: string
  attachments?: Array<{name: string, size: string}>
  onSend?: () => void
  onCancel?: () => void
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  subject,
  from = 'noreply@chatterwise.ai',
  to,
  body,
  attachments = [],
  onSend,
  onCancel
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Email Preview</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <div className="text-sm text-gray-900">{from}</div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <div className="text-sm text-gray-900">{to}</div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
            <div className="text-sm font-medium text-gray-900">{subject}</div>
          </div>
        </div>
      </div>
      
      {/* Body */}
      <div className="p-6 bg-gray-50 min-h-[200px] max-h-[400px] overflow-y-auto">
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: body }} />
      </div>
      
      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="text-xs font-medium text-gray-500 mb-2">Attachments ({attachments.length})</h4>
          <div className="space-y-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Download className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{attachment.name}</span>
                </div>
                <span className="text-xs text-gray-500">{attachment.size}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="border-t border-gray-200 p-4 flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onSend}
          className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          Send Email
        </button>
      </div>
    </div>
  )
}