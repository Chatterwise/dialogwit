import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ProcessRequest {
  chatbotId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { chatbotId }: ProcessRequest = await req.json()

    if (!chatbotId) {
      return new Response(
        JSON.stringify({ error: 'Missing chatbotId' }),
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

    // Update chatbot status to processing
    await supabaseClient
      .from('chatbots')
      .update({ status: 'processing' })
      .eq('id', chatbotId)

    // Get unprocessed knowledge base items
    const { data: knowledgeItems, error: kbError } = await supabaseClient
      .from('knowledge_base')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .eq('processed', false)

    if (kbError) {
      throw new Error('Failed to retrieve knowledge base items')
    }

    // Process each knowledge base item
    for (const item of knowledgeItems || []) {
      // Simulate AI processing (chunking, embedding, indexing)
      await processKnowledgeItem(item)
      
      // Mark as processed
      await supabaseClient
        .from('knowledge_base')
        .update({ processed: true })
        .eq('id', item.id)
    }

    // Update chatbot status to ready
    await supabaseClient
      .from('chatbots')
      .update({ 
        status: 'ready',
        knowledge_base_processed: true 
      })
      .eq('id', chatbotId)

    return new Response(
      JSON.stringify({ success: true, message: 'Knowledge base processed successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Process knowledge base error:', error)
    
    // Update chatbot status to error
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const { chatbotId } = await req.json().catch(() => ({}))
    if (chatbotId) {
      await supabaseClient
        .from('chatbots')
        .update({ status: 'error' })
        .eq('id', chatbotId)
    }

    return new Response(
      JSON.stringify({ error: 'Failed to process knowledge base' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function processKnowledgeItem(item: any): Promise<void> {
  // Mock processing - in production, this would:
  // 1. Parse and chunk the content
  // 2. Generate embeddings using OpenAI or similar
  // 3. Store in vector database
  // 4. Create search indexes
  
  console.log(`Processing knowledge item: ${item.id}`)
  console.log(`Content type: ${item.content_type}`)
  console.log(`Content length: ${item.content.length} characters`)
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
  
  console.log(`Finished processing item: ${item.id}`)
}