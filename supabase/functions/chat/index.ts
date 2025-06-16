import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ChatRequest {
  botId: string
  message: string
  userIp?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { botId, message, userIp }: ChatRequest = await req.json()

    if (!botId || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing botId or message' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get chatbot and knowledge base
    const { data: chatbot, error: chatbotError } = await supabaseClient
      .from('chatbots')
      .select('*')
      .eq('id', botId)
      .eq('status', 'ready')
      .single()

    if (chatbotError || !chatbot) {
      return new Response(
        JSON.stringify({ error: 'Chatbot not found or not ready' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get knowledge base content
    const { data: knowledgeBase, error: kbError } = await supabaseClient
      .from('knowledge_base')
      .select('content')
      .eq('chatbot_id', botId)
      .eq('processed', true)

    if (kbError) {
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve knowledge base' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Combine all knowledge base content
    const knowledgeContent = knowledgeBase
      ?.map(kb => kb.content)
      .join('\n\n') || ''

    // Generate AI response using OpenAI or fallback
    const aiResponse = await generateAIResponse(message, knowledgeContent, chatbot.name)

    // Save chat message
    const { error: messageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        chatbot_id: botId,
        message,
        response: aiResponse,
        user_ip: userIp
      })

    if (messageError) {
      console.error('Failed to save chat message:', messageError)
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Chat function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function generateAIResponse(message: string, knowledgeBase: string, botName: string): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    return generateMockResponse(message, knowledgeBase, botName)
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are ${botName}, a helpful AI assistant. Use the following knowledge base to answer questions accurately and helpfully. If the question cannot be answered from the knowledge base, politely say so and offer to help with something else.

Knowledge Base:
${knowledgeBase}

Instructions:
- Always be helpful and professional
- Base your answers on the provided knowledge base
- If you don't know something from the knowledge base, admit it
- Keep responses concise but informative
- Use a friendly, conversational tone`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error('OpenAI API request failed')
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your request.'

  } catch (error) {
    console.error('OpenAI API error:', error)
    return generateMockResponse(message, knowledgeBase, botName)
  }
}

function generateMockResponse(message: string, knowledgeBase: string, botName: string): string {
  // Enhanced mock responses that try to use knowledge base content
  const lowerMessage = message.toLowerCase()
  const knowledgeWords = knowledgeBase.toLowerCase().split(/\s+/)
  
  // Find relevant content from knowledge base
  const messageWords = lowerMessage.split(/\s+/)
  const relevantWords = messageWords.filter(word => 
    word.length > 3 && knowledgeWords.includes(word)
  )

  if (relevantWords.length > 0) {
    // Try to find sentences containing relevant words
    const sentences = knowledgeBase.split(/[.!?]+/)
    const relevantSentences = sentences.filter(sentence => 
      relevantWords.some(word => sentence.toLowerCase().includes(word))
    )

    if (relevantSentences.length > 0) {
      const bestSentence = relevantSentences[0].trim()
      return `Based on the information I have, ${bestSentence}. Is there anything specific you'd like to know more about?`
    }
  }

  // Fallback responses
  const responses = [
    `Hello! I'm ${botName}. I'd be happy to help you with that. Based on my knowledge base, let me provide you with the most relevant information I can find.`,
    `That's a great question! From what I understand in my training data, I can help you with information related to your query.`,
    `I appreciate you asking! Let me search through my knowledge base to provide you with the most accurate information available.`,
    `Thank you for your question about "${message}". I'll do my best to provide helpful information based on what I know.`,
  ]

  const randomResponse = responses[Math.floor(Math.random() * responses.length)]
  
  // Add a snippet from knowledge base if available
  if (knowledgeBase.length > 0) {
    const snippet = knowledgeBase.substring(0, 150).trim()
    return `${randomResponse}\n\nHere's some relevant information: ${snippet}${knowledgeBase.length > 150 ? '...' : ''}`
  }
  
  return randomResponse
}