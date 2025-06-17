import React, { useState } from 'react'
import { AlertTriangle, Trash2, Loader } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useDeleteAccount } from '../hooks/useDeleteAccount'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const deleteAccount = useDeleteAccount()
  
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  if (!isOpen) return null
  
  const handleDelete = async () => {
    if (!user) return
    
    if (confirmation !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }
    
    setError(null)
    
    try {
      await deleteAccount.mutateAsync(user.id)
      navigate('/auth')
    } catch (error) {
      console.error('Failed to delete account:', error)
      setError('Failed to delete account. Please try again.')
    }
  }
  
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
          <h3 className="text-lg font-bold text-gray-900">Delete Account</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">
              <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted, including:
            </p>
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
              <li>All chatbots and their configurations</li>
              <li>Knowledge base content</li>
              <li>Chat history and analytics</li>
              <li>Subscription and billing information</li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-600">
            To confirm, please type <strong>DELETE</strong> in the field below:
          </p>
          
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
            placeholder="Type DELETE to confirm"
          />
          
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmation !== 'DELETE' || deleteAccount.isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {deleteAccount.isPending ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}