import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { fetchWithRetry } from '../lib/http'

export interface TestMessage {
  id: string
  message: string
  expectedResponse?: string
  actualResponse?: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  timestamp?: string
  responseTime?: number
}

export interface TestScenario {
  id: string
  user_id: string
  chatbot_id: string
  name: string
  description: string
  test_messages: TestMessage[]
  expected_responses?: string[]
  last_run_at?: string
  last_run_results?: Record<string, any>
  status: 'draft' | 'active' | 'archived'
  created_at: string
  updated_at: string
}

export const useTestScenarios = (userId: string, chatbotId?: string) => {
  return useQuery({
    queryKey: ['test_scenarios', userId, chatbotId],
    queryFn: async () => {
      let query = supabase
        .from('test_scenarios')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (chatbotId) {
        query = query.eq('chatbot_id', chatbotId)
      }

      const { data, error } = await query

      if (error) throw error
      return data as TestScenario[]
    },
    enabled: !!userId
  })
}

export const useCreateTestScenario = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (scenario: Omit<TestScenario, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('test_scenarios')
        .insert({
          ...scenario,
          test_messages: scenario.test_messages || [],
          expected_responses: scenario.expected_responses || [],
          last_run_results: {},
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error
      return data as TestScenario
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['test_scenarios', data.user_id] })
    }
  })
}

export const useUpdateTestScenario = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string
      updates: Partial<TestScenario> 
    }) => {
      const { data, error } = await supabase
        .from('test_scenarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as TestScenario
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['test_scenarios', data.user_id] })
    }
  })
}

export const useDeleteTestScenario = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('test_scenarios')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { id }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test_scenarios'] })
    }
  })
}

export const useRunTestScenario = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      scenarioId, 
      chatbotId 
    }: { 
      scenarioId: string
      chatbotId: string 
    }) => {
      // Get the test scenario
      const { data: scenario, error: scenarioError } = await supabase
        .from('test_scenarios')
        .select('*')
        .eq('id', scenarioId)
        .single()

      if (scenarioError) throw scenarioError

      const results: TestMessage[] = []
      
      // Run each test message
      for (const testMessage of scenario.test_messages) {
        const startTime = Date.now()
        
        try {
          // Call the chat endpoint
          const response = await fetchWithRetry(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              botId: chatbotId,
              message: testMessage.message,
              userIp: 'test-scenario'
            }),
            timeoutMs: 20000,
            retries: 1,
          })

          const responseTime = Date.now() - startTime
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const data = await response.json()
          
          // Check if response matches expected (if provided)
          let status: 'passed' | 'failed' = 'passed'
          if (testMessage.expectedResponse) {
            const actualLower = data.response.toLowerCase()
            const expectedLower = testMessage.expectedResponse.toLowerCase()
            
            // Simple contains check - could be made more sophisticated
            status = actualLower.includes(expectedLower) || 
                     expectedLower.includes(actualLower) ? 'passed' : 'failed'
          }

          results.push({
            ...testMessage,
            actualResponse: data.response,
            status,
            responseTime,
            timestamp: new Date().toISOString()
          })

        } catch (error) {
          const responseTime = Date.now() - startTime
          
          results.push({
            ...testMessage,
            actualResponse: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            status: 'failed',
            responseTime,
            timestamp: new Date().toISOString()
          })
        }

        // Small delay between requests to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Calculate summary statistics
      const totalTests = results.length
      const passedTests = results.filter(r => r.status === 'passed').length
      const failedTests = results.filter(r => r.status === 'failed').length
      const avgResponseTime = results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / totalTests

      const runResults = {
        total_tests: totalTests,
        passed_tests: passedTests,
        failed_tests: failedTests,
        success_rate: (passedTests / totalTests) * 100,
        avg_response_time: avgResponseTime,
        run_timestamp: new Date().toISOString(),
        test_results: results
      }

      // Update the scenario with results
      const { data: updatedScenario, error: updateError } = await supabase
        .from('test_scenarios')
        .update({
          test_messages: results,
          last_run_at: new Date().toISOString(),
          last_run_results: runResults,
          status: 'active'
        })
        .eq('id', scenarioId)
        .select()
        .single()

      if (updateError) throw updateError

      return {
        scenario: updatedScenario,
        results: runResults
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['test_scenarios'] })
    }
  })
}
