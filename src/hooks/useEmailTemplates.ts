import { useState } from 'react'
import { useAuth } from './useAuth'
import { useEmailUsage } from './useEmailUsage'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
}

interface SendEmailParams {
  to: string | string[]
  templateId: string
  variables?: Record<string, string>
  attachments?: File[]
}

export const useEmailTemplates = () => {
  const { user } = useAuth()
  const { trackEmail, checkEmailAllowed } = useEmailUsage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock templates - in a real app, these would come from an API
  const templates: EmailTemplate[] = [
    {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to ChatterWise!',
      body: `<p>Hello {{name}},</p>
             <p>Welcome to ChatterWise! We're excited to have you on board.</p>
             <p>Get started by creating your first chatbot.</p>
             <p>Best regards,<br>The ChatterWise Team</p>`,
      variables: ['name']
    },
    {
      id: 'password-reset',
      name: 'Password Reset',
      subject: 'Reset Your Password',
      body: `<p>Hello,</p>
             <p>You requested a password reset. Click the link below to reset your password:</p>
             <p><a href="{{resetLink}}">Reset Password</a></p>
             <p>If you didn't request this, please ignore this email.</p>
             <p>Best regards,<br>The ChatterWise Team</p>`,
      variables: ['resetLink']
    },
    {
      id: 'chatbot-report',
      name: 'Chatbot Performance Report',
      subject: 'Your Weekly Chatbot Report',
      body: `<p>Hello {{name}},</p>
             <p>Here's your weekly report for {{chatbotName}}:</p>
             <ul>
               <li>Total conversations: {{totalConversations}}</li>
               <li>Unique users: {{uniqueUsers}}</li>
               <li>Average satisfaction: {{satisfactionRate}}%</li>
             </ul>
             <p>View detailed analytics in your <a href="{{dashboardLink}}">dashboard</a>.</p>
             <p>Best regards,<br>The ChatterWise Team</p>`,
      variables: ['name', 'chatbotName', 'totalConversations', 'uniqueUsers', 'satisfactionRate', 'dashboardLink']
    }
  ]

  const getTemplate = (templateId: string): EmailTemplate | undefined => {
    return templates.find(t => t.id === templateId)
  }

  const renderTemplate = (template: EmailTemplate, variables: Record<string, string> = {}): string => {
    let rendered = template.body
    
    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      rendered = rendered.replace(regex, value)
    }
    
    // Replace any remaining variables with placeholders
    template.variables.forEach(variable => {
      const regex = new RegExp(`{{${variable}}}`, 'g')
      if (rendered.match(regex)) {
        rendered = rendered.replace(regex, `[${variable}]`)
      }
    })
    
    return rendered
  }

  const sendEmail = async ({ to, templateId, variables = {}, attachments = [] }: SendEmailParams) => {
    setLoading(true)
    setError(null)
    
    try {
      // Check if we can send emails
      const emailsAllowed = await checkEmailAllowed()
      
      if (!emailsAllowed) {
        setError('Email limit reached. Please upgrade your plan to send more emails.')
        return false
      }
      
      const template = getTemplate(templateId)
      
      if (!template) {
        setError('Email template not found')
        return false
      }
      
      // In a real app, this would call your API to send the email
      console.log('Sending email:', {
        to,
        subject: template.subject,
        body: renderTemplate(template, variables),
        attachments
      })
      
      // Track email usage
      const recipients = Array.isArray(to) ? to.length : 1
      await trackEmail(recipients)
      
      return true
    } catch (err) {
      console.error('Failed to send email:', err)
      setError('Failed to send email. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    templates,
    getTemplate,
    renderTemplate,
    sendEmail,
    loading,
    error
  }
}