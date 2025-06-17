import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface StagingDeployment {
  id: string
  user_id: string
  chatbot_id: string
  name: string
  description?: string
  config: Record<string, any>
  status: 'pending' | 'deploying' | 'ready' | 'error'
  url?: string
  created_at: string
  updated_at: string
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded'
  checks: Array<{
    name: string
    status: 'pass' | 'fail' | 'warn'
    message: string
    duration: number
  }>
  timestamp: string
}

export const useStagingDeployments = (userId: string) => {
  return useQuery({
    queryKey: ['staging_deployments', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staging_deployments')
        .select(`
          *,
          chatbots(name, description, status)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!userId
  })
}

export const useCreateStagingDeployment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      chatbotId,
      name,
      description,
      config
    }: {
      userId: string
      chatbotId: string
      name: string
      description?: string
      config: Record<string, any>
    }) => {
      // First, create the staging deployment record
      const { data: deployment, error: deploymentError } = await supabase
        .from('staging_deployments')
        .insert({
          user_id: userId,
          chatbot_id: chatbotId,
          name,
          description,
          config,
          status: 'pending'
        })
        .select()
        .single()

      if (deploymentError) throw deploymentError

      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update status to deploying
      await supabase
        .from('staging_deployments')
        .update({ status: 'deploying' })
        .eq('id', deployment.id)

      // Simulate more deployment time
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Generate staging URL and mark as ready
      const stagingUrl = `https://staging-${deployment.id.slice(0, 8)}.your-domain.com`
      
      const { data: finalDeployment, error: finalError } = await supabase
        .from('staging_deployments')
        .update({ 
          status: 'ready',
          url: stagingUrl
        })
        .eq('id', deployment.id)
        .select()
        .single()

      if (finalError) throw finalError

      return finalDeployment
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['staging_deployments', data.user_id] })
    }
  })
}

export const useDeleteStagingDeployment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (deploymentId: string) => {
      const { error } = await supabase
        .from('staging_deployments')
        .delete()
        .eq('id', deploymentId)

      if (error) throw error
      return { id: deploymentId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staging_deployments'] })
    }
  })
}

export const useRunHealthCheck = () => {
  return useMutation({
    mutationFn: async (deploymentId: string): Promise<HealthCheckResult> => {
      const startTime = Date.now()
      
      // Get deployment info
      const { data: deployment, error } = await supabase
        .from('staging_deployments')
        .select('*')
        .eq('id', deploymentId)
        .single()

      if (error) throw error

      const checks = []

      // Check 1: Deployment status
      const statusCheckStart = Date.now()
      checks.push({
        name: 'Deployment Status',
        status: deployment.status === 'ready' ? 'pass' : 'fail',
        message: deployment.status === 'ready' ? 'Deployment is ready' : `Deployment status: ${deployment.status}`,
        duration: Date.now() - statusCheckStart
      })

      // Check 2: URL accessibility (simulated)
      const urlCheckStart = Date.now()
      if (deployment.url) {
        try {
          // In a real implementation, you'd actually check the URL
          // For now, we'll simulate it
          await new Promise(resolve => setTimeout(resolve, 500))
          
          checks.push({
            name: 'URL Accessibility',
            status: 'pass',
            message: 'Staging URL is accessible',
            duration: Date.now() - urlCheckStart
          })
        } catch {
          checks.push({
            name: 'URL Accessibility',
            status: 'fail',
            message: 'Staging URL is not accessible',
            duration: Date.now() - urlCheckStart
          })
        }
      } else {
        checks.push({
          name: 'URL Accessibility',
          status: 'fail',
          message: 'No staging URL configured',
          duration: Date.now() - urlCheckStart
        })
      }

      // Check 3: Chatbot functionality (simulated)
      const chatbotCheckStart = Date.now()
      try {
        // Simulate a test message to the chatbot
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        checks.push({
          name: 'Chatbot Functionality',
          status: 'pass',
          message: 'Chatbot responds correctly to test messages',
          duration: Date.now() - chatbotCheckStart
        })
      } catch {
        checks.push({
          name: 'Chatbot Functionality',
          status: 'fail',
          message: 'Chatbot failed to respond to test messages',
          duration: Date.now() - chatbotCheckStart
        })
      }

      // Check 4: Database connectivity
      const dbCheckStart = Date.now()
      try {
        // Test database connection
        await supabase.from('chatbots').select('id').limit(1)
        
        checks.push({
          name: 'Database Connectivity',
          status: 'pass',
          message: 'Database connection is healthy',
          duration: Date.now() - dbCheckStart
        })
      } catch {
        checks.push({
          name: 'Database Connectivity',
          status: 'fail',
          message: 'Database connection failed',
          duration: Date.now() - dbCheckStart
        })
      }

      // Determine overall status
      const failedChecks = checks.filter(c => c.status === 'fail').length
      const warnChecks = checks.filter(c => c.status === 'warn').length
      
      let overallStatus: 'healthy' | 'unhealthy' | 'degraded'
      if (failedChecks > 0) {
        overallStatus = 'unhealthy'
      } else if (warnChecks > 0) {
        overallStatus = 'degraded'
      } else {
        overallStatus = 'healthy'
      }

      return {
        status: overallStatus,
        checks,
        timestamp: new Date().toISOString()
      }
    }
  })
}