import { generateEmbedding, generateChatCompletion, streamChatCompletion, OpenAIError } from '../utils/openai.ts';
import { searchSimilarChunks, fallbackTextSearch } from '../utils/database.ts';

export async function generateRAGResponse(message, botId, supabaseClient, options = {}, userId) {
  const {
    enableCitations = false,
    maxRetrievedChunks = 3,
    similarityThreshold = 0.7,
    enableStreaming = false,
    model = 'gpt-3.5-turbo',
    temperature = 0.7,
    maxTokens = 500,
    chunkCharLimit = 200
  } = options;

  const { data: chatbot, error: botError } = await supabaseClient
    .from('chatbots')
    .select('*, bot_role_templates(*)')
    .eq('id', botId)
    .single();
  if (botError || !chatbot) throw new Error('Chatbot not found');

  // ⛔️ Auto-disable RAG for very short inputs
  const wordCount = message.trim().split(/\s+/).length;
if (wordCount <= 5) {
  console.log(`Skipping RAG for short message: "${message}"`);

  const fallbackResponse = await generateFallbackResponse(message, botId, chatbot.name, supabaseClient);

  // Estimate fallback token usage
  const estimatedPromptTokens = Math.ceil(message.length / 4) + 10;
  const estimatedResponseTokens = Math.ceil(fallbackResponse.length / 4);
  const estimatedTotalTokens = estimatedPromptTokens + estimatedResponseTokens;
  const costPerToken = 0.0015 / 1000; // gpt-3.5-turbo
  const estimatedCost = estimatedTotalTokens * costPerToken;

  console.log(`Estimated tokens used (fallback): ${estimatedTotalTokens}`);
  console.log(`Estimated cost (USD): $${estimatedCost.toFixed(6)}`);

  return { response: fallbackResponse, citations_enabled: false };
}

  let retrievedChunks = [];
  let context = '';

  try {
    const embeddingResponse = await generateEmbedding(message);
    const queryEmbedding = embeddingResponse.data[0].embedding;

    retrievedChunks = await searchSimilarChunks(supabaseClient, queryEmbedding, botId, {
      matchThreshold: similarityThreshold,
      matchCount: maxRetrievedChunks
    });

    if (retrievedChunks.length > 0) {
      context = retrievedChunks
        .map((chunk, index) => `Chunk [${index + 1}]: ${chunk.content.slice(0, chunkCharLimit)}`)
        .join('\n\n');
    }
  } catch (error) {
    if (error instanceof OpenAIError) throw error;
    console.error('RAG retrieval error:', error);

    const fallbackChunks = await fallbackTextSearch(supabaseClient, message, botId);
    if (fallbackChunks.length > 0) {
      context = fallbackChunks
        .map((chunk, index) => `Chunk [${index + 1}]: ${chunk.content.slice(0, chunkCharLimit)}`)
        .join('\n\n');
    }
  }

  const systemPrompt = buildSystemPrompt(
    chatbot.name,
    context,
    enableCitations,
    chatbot.bot_role_templates?.system_instructions
  );

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ];

  if (enableStreaming) {
    throw new Error('Streaming is only supported via generateStreamingRAGResponse(). Please call that instead.');
  }

  const chatResponse = await generateChatCompletion(messages, {
    model,
    temperature,
    max_tokens: maxTokens
  });

  const responseText = chatResponse.choices?.[0]?.message?.content ||
    'I apologize, but I encountered an error processing your request.';

  const totalTokens =
    chatResponse.usage?.total_tokens ??
    estimatePromptTokens(messages) + Math.ceil(responseText.length / 4);

  console.log(chatResponse.usage?.total_tokens
    ? `Total tokens used OPENAI: ${totalTokens}`
    : `Using own token estimation: ${totalTokens}`);

  if (userId && supabaseClient) {
    const { error } = await supabaseClient.rpc('track_token_usage', {
      p_user_id: userId,
      p_chatbot_id: botId,
      p_metric_name: 'chat_tokens_per_month',
      p_token_count: totalTokens,
      p_usage_source: 'chat',
      p_metadata: {
        message_length: message.length,
        response_length: responseText.length,
        context_chunks: retrievedChunks.length,
        model,
        estimated_tokens: totalTokens
      }
    });

    if (error) {
      console.error('Error tracking token usage:', error);
    } else {
      console.log(`Tracked ${totalTokens} tokens for user ${userId} in chatbot ${botId}`);
    }
  }

  const ragResponse = {
    response: responseText,
    citations_enabled: enableCitations
  };

  if (enableCitations && retrievedChunks.length > 0) {
    ragResponse.sources = retrievedChunks.map((chunk) => ({
      content: chunk.content.slice(0, 200) + '...',
      similarity: chunk.similarity,
      chunk_index: chunk.chunk_index,
      source_url: chunk.source_url
    }));
  }

  return ragResponse;
}


//generateStreamingRAGResponse
export async function generateStreamingRAGResponse({ message, chatbotId, userId }, supabaseClient) {
  const { data: chatbot, error: botError } = await supabaseClient.from('chatbots').select('*, bot_role_templates(*)').eq('id', chatbotId).single();
  if (botError || !chatbot) {
    throw new Error('Chatbot not found');
  }
  const embeddingResponse = await generateEmbedding(message);
  const queryEmbedding = embeddingResponse.data[0].embedding;
  const retrievedChunks = await searchSimilarChunks(supabaseClient, queryEmbedding, chatbotId, {
    matchThreshold: 0.7,
    matchCount: 5
  });
  const context = retrievedChunks.map((chunk, i)=>`[${i + 1}] ${chunk.content}`).join('\n\n');
  const systemPrompt = buildSystemPrompt(chatbot.name, context, false, chatbot.bot_role_templates?.system_instructions);
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
  // This returns a ReadableStream for Deno/Supabase Edge
  const stream = await generateReadableStreamChatCompletion(messages, {
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 500
  });
  return stream;
}
export async function generateFallbackResponse(message, botId, botName, supabaseClient) {
  try {
    // Simple keyword search in chunks
    const fallbackChunks = await fallbackTextSearch(supabaseClient, message, botId);
    if (fallbackChunks.length > 0) {
      const context = fallbackChunks.map((chunk)=>chunk.content).join('\n\n').substring(0, 300);
      return `Hello! I'm ${botName}. Based on the information I have: ${context}... Is there anything specific you'd like to know more about?`;
    }
  } catch (error) {
    console.error('Fallback search error:', error);
  }
  // Final fallback responses
  const responses = [
    `Hello! I'm ${botName}. I'd be happy to help you with that. Could you please provide more details about what you're looking for?`,
    `Hi there! I'm ${botName}, your AI assistant. I'm here to help answer your questions. What would you like to know?`,
    `Thank you for your question! I'm ${botName} and I'm designed to help with information from my knowledge base. Could you rephrase your question or ask about something more specific?`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
export async function generateReadableStreamChatCompletion(messages, options = {}) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start (controller) {
      try {
        for await (const chunk of streamChatCompletion(messages, options)){
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    }
  });
  return stream;
}
function buildSystemPrompt(botName, context, enableCitations, customInstructions) {
  if (!context) {
    return `You are ${botName}, an AI assistant who can only answer questions using a provided knowledge base.

No context was found, so you must not answer any question.

Reply with: "I'm sorry, I don't have any information available to answer that question."`;
  }

  return `You are ${botName}, an AI assistant answering questions strictly using the knowledge base below.

Knowledge Base:
${context}

Instructions:
- Be brief and clear.
- Only use the provided knowledge base. Do not use external information.
- If the context doesn't include a relevant answer, say: "Thanks for your question! I don’t have the information to answer that right now based on my sources. Please try asking something else or rephrase your question."
${enableCitations ? '- Mention that your answers come from the knowledge base.' : ''}
${customInstructions ? `- Additional Role Instructions:\n${customInstructions}` : ''}`;
}
function estimatePromptTokens(messages) {
  const total = messages.map((m)=>m.content).join(' ');
  return Math.ceil(total.length / 4) + messages.length * 10;
}

