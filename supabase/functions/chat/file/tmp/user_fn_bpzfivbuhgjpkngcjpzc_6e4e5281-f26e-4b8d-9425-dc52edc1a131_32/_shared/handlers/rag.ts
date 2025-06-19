import OpenAI from 'https://esm.sh/openai@4.24.1';
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')
});
export async function generateRAGResponse(request, supabaseClient) {
  const { message, chatbotId, userId, context = [], stream = false } = request;
  try {
    let relevantContext = context;
    if (relevantContext.length === 0) {
      relevantContext = await retrieveRelevantContext(supabaseClient, chatbotId, message);
    }
    const systemPrompt = buildSystemPrompt(relevantContext);
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: message
      }
    ];
    if (userId) {
      const tokenEstimate = estimatePromptTokens(messages);
      const limitCheck = await supabaseClient.rpc('check_token_limit', {
        p_user_id: userId,
        p_metric_name: 'chat_tokens_per_month',
        p_estimated_tokens: tokenEstimate
      });
      console.log('Generating RAG response with:', {
        userId,
        chatbotId,
        message
      });
    // if (limitCheck.current_usage > limitCheck.limit) {
    //   throw new Error(`Token limit would be exceeded. Current usage: ${limitCheck.current_usage}/${limitCheck.limit}`);
    // }
    // if (!limitCheck.allowed) {
    //   throw new Error(`Token limit would be exceeded. Current usage: ${limitCheck.current_usage}/${limitCheck.limit} tokens`);
    // }
    }
    let response = '';
    let usage;
    if (stream) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true
      });
      const chunks = [];
      for await (const chunk of completion){
        const delta = chunk.choices?.[0]?.delta?.content || '';
        chunks.push(delta);
      }
      response = chunks.join('');
      usage = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 1
      }).then((res)=>res.usage);
    } else {
      const result = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 1000
      });
      response = result.choices[0].message.content || '';
      usage = result.usage;
    }
    if (userId && usage.total_tokens > 0) {
      await supabaseClient.rpc('track_token_usage', {
        p_user_id: userId,
        p_metric_name: 'chat_tokens_per_month',
        p_token_count: usage.total_tokens,
        p_metadata: {
          chatbot_id: chatbotId,
          message_length: message.length,
          response_length: response.length,
          context_chunks: relevantContext.length,
          model: 'gpt-3.5-turbo',
          tokens: usage,
          raw_response_length: response.length,
          estimated_vs_actual: {
            estimated_prompt_tokens: estimatePromptTokens(messages),
            actual_prompt_tokens: usage.prompt_tokens
          }
        }
      });
    }
    const costEstimate = calculateCostEstimate(usage, 'gpt-3.5-turbo');
    return {
      response,
      context: relevantContext,
      usage,
      cost_estimate: costEstimate
    };
  } catch (error) {
    throw new Error(`RAG generation failed: ${error.message}`);
  }
}
export async function generateStreamingRAGResponse(request, supabaseClient) {
  const { message, chatbotId, userId, context = [] } = request;
  const relevantContext = context.length > 0 ? context : await retrieveRelevantContext(supabaseClient, chatbotId, message);
  const systemPrompt = buildSystemPrompt(relevantContext);
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: message
    }
  ];
  if (userId) {
    const tokenEstimate = estimatePromptTokens(messages);
    const { data: limitCheck, error: limitError } = await supabaseClient.rpc('check_token_limit', {
      p_user_id: userId,
      p_metric_name: 'chat_tokens_per_month',
      p_estimated_tokens: tokenEstimate
    });
    if (limitError) {
      console.error('Limit check failed:', limitError);
      throw new Error('Token limit check failed');
    }
    if (!limitCheck.allowed) {
      throw new Error(`Token limit would be exceeded. Current usage: ${limitCheck.current_usage}/${limitCheck.limit} tokens`);
    }
  }
  const stream = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    max_tokens: 1000,
    stream: true
  });
  if (userId) {
    openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 1
    }).then(async (usageResult)=>{
      const usage = usageResult.usage;
      if (usage.total_tokens > 0) {
        try {
          await supabaseClient.rpc('track_token_usage', {
            p_user_id: userId,
            p_metric_name: 'chat_tokens_per_month',
            p_token_count: usage.total_tokens,
            p_metadata: {
              chatbot_id: chatbotId,
              message_length: message.length,
              context_chunks: relevantContext.length,
              model: 'gpt-3.5-turbo',
              streaming: true,
              usage
            }
          });
        } catch (rpcError) {
          console.error('Token tracking RPC failed:', rpcError);
          await supabaseClient.from('billing_failures').insert({
            user_id: userId,
            tokens: usage.total_tokens,
            metadata: {
              chatbot_id: chatbotId,
              message_length: message.length,
              context_chunks: relevantContext.length,
              model: 'gpt-3.5-turbo',
              streaming: true,
              usage
            },
            error: rpcError.message
          });
        }
      }
    }).catch(console.error);
  }
  return stream;
}
async function retrieveRelevantContext(supabaseClient, chatbotId, query, limit = 5) {
  try {
    const { data: vectorResults, error: vectorError } = await supabaseClient.rpc('match_documents', {
      query_embedding: null,
      match_threshold: 0.7,
      match_count: limit,
      chatbot_id: chatbotId
    });
    if (!vectorError && vectorResults?.length > 0) {
      return vectorResults.map((result)=>({
          content: result.content,
          source_url: result.source_url,
          chunk_index: result.chunk_index,
          similarity: result.similarity
        }));
    }
    const { data: textResults, error: textError } = await supabaseClient.from('kb_chunks').select('content, source_url, chunk_index, metadata').eq('chatbot_id', chatbotId).textSearch('content', query.split(' ').join(' | ')).limit(limit);
    if (textError) {
      console.error('Text search error:', textError);
      return [];
    }
    return textResults?.map((result)=>({
        content: result.content,
        source_url: result.source_url,
        chunk_index: result.chunk_index,
        similarity: 0.5
      })) || [];
  } catch (error) {
    console.error('Context retrieval error:', error);
    return [];
  }
}
function buildSystemPrompt(context) {
  if (context.length === 0) {
    return `You are a helpful AI assistant. Answer the user's question to the best of your ability.`;
  }
  const contextText = context.map((ctx, index)=>`[${index + 1}] ${ctx.content}`).join('\n\n');
  return `You are a helpful AI assistant. Use the following context to answer the user's question. If the context doesn't contain relevant information, say so and provide a general helpful response.

Context:
${contextText}

Instructions:
- Answer based on the provided context when relevant
- Be concise and helpful
- If you're not sure about something, say so
- Cite the context when appropriate using [1], [2], etc.`;
}
function estimatePromptTokens(messages, model = 'gpt-3.5-turbo') {
  try {
    const encoder = encoding_for_model(model);
    let tokens = 0;
    for (const message of messages){
      tokens += 4;
      tokens += encoder.encode(message.content || '').length;
      tokens += encoder.encode(message.role || '').length;
    }
    tokens += 2;
    encoder.free?.();
    return tokens;
  } catch (err) {
    console.warn("Fallback to rough estimate: ", err);
    const totalText = messages.map((m)=>m.content).join(' ');
    return Math.ceil(totalText.length / 4) + messages.length * 10;
  }
}
function calculateCostEstimate(usage, model) {
  const pricing = {
    'gpt-3.5-turbo': {
      input: 0.0015,
      output: 0.002
    },
    'gpt-4': {
      input: 0.03,
      output: 0.06
    }
  };
  const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
  const inputCost = usage.prompt_tokens / 1000 * modelPricing.input;
  const outputCost = (usage.completion_tokens || 0) / 1000 * modelPricing.output;
  return inputCost + outputCost;
}
