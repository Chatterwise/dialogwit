import { generateEmbedding, generateChatCompletion, streamChatCompletion, OpenAIError } from '../utils/openai.ts';
import { searchSimilarChunks, fallbackTextSearch, getChatbot } from '../utils/database.ts';

export async function generateRAGResponse(message, botId, supabaseClient, options = {}, userId) {
  const { enableCitations = false, maxRetrievedChunks = 5, similarityThreshold = 0.7, enableStreaming = false, model = 'gpt-3.5-turbo', temperature = 0.7, maxTokens = 500 } = options;
  // Get chatbot info
  const chatbot = await getChatbot(supabaseClient, botId);
  let retrievedChunks = [];
  let context = '';
  try {
    // Step 1: Create embedding for the user's query
    const embeddingResponse = await generateEmbedding(message);
    const queryEmbedding = embeddingResponse.data[0].embedding;
    // Step 2: Search for similar chunks
    retrievedChunks = await searchSimilarChunks(supabaseClient, queryEmbedding, botId, {
      matchThreshold: similarityThreshold,
      matchCount: maxRetrievedChunks
    });
    // Step 3: Build context from retrieved chunks
    if (retrievedChunks.length > 0) {
      context = retrievedChunks.map((chunk, index)=>`[${index + 1}] ${chunk.content}`).join('\n\n');
    }
  } catch (error) {
    if (error instanceof OpenAIError) {
      throw error;
    }
    console.error('RAG retrieval error:', error);
    // Fallback to text search
    const fallbackChunks = await fallbackTextSearch(supabaseClient, message, botId);
    if (fallbackChunks.length > 0) {
      context = fallbackChunks.map((chunk, index)=>`[${index + 1}] ${chunk.content}`).join('\n\n');
    }
  }
  const systemPrompt = buildSystemPrompt(chatbot.name, context, enableCitations);
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
  // ✅ Optional: Check token limit before proceeding
  // if (userId && supabaseClient) {
  //   try {
  //     const estimatedTokens = estimatePromptTokens(messages);
  //     const { data: limitCheck, error } = await supabaseClient.rpc('check_token_limit', {
  //       p_user_id: userId,
  //       p_metric_name: 'chat_tokens_per_month',
  //       p_estimated_tokens: estimatedTokens
  //     });
  //     if (error) throw new Error('Token limit check failed');
  //     if (!limitCheck.allowed) {
  //       throw new Error(`Token limit exceeded. Usage: ${limitCheck.current_usage}/${limitCheck.limit}`);
  //     }
  //   } catch (err) {
  //     console.error('Token limit error:', err);
  //     throw err;
  //   }
  // }
  // Streaming not supported here
  if (enableStreaming) {
    throw new Error('Streaming is only supported via generateStreamingRAGResponse(). Please call that instead.');
  }
  // Step 4: Generate chat completion
  const chatResponse = await generateChatCompletion(messages, {
    model,
    temperature,
    max_tokens: maxTokens
  });
  const responseText = chatResponse.choices?.[0]?.message?.content || 'I apologize, but I encountered an error processing your request.';
  // ✅ Token tracking after generation
  if (userId && supabaseClient) {
    try {
      const totalTokens = estimatePromptTokens(messages) + Math.ceil(responseText.length / 4);
      await supabaseClient.rpc('track_token_usage', {
        p_user_id: userId,
        p_metric_name: 'chat_tokens_per_month',
        p_token_count: totalTokens,
        p_metadata: {
          chatbot_id: botId,
          message_length: message.length,
          response_length: responseText.length,
          context_chunks: retrievedChunks.length,
          model,
          estimated_tokens: totalTokens
        }
      });
    } catch (err) {
      console.error('Token usage tracking failed:', err);
    }
  }
  const ragResponse = {
    response: responseText,
    citations_enabled: enableCitations
  };
  if (enableCitations && retrievedChunks.length > 0) {
    ragResponse.sources = retrievedChunks.map((chunk)=>({
        content: chunk.content.substring(0, 200) + '...',
        similarity: chunk.similarity,
        chunk_index: chunk.chunk_index,
        source_url: chunk.source_url
      }));
  }
  return ragResponse;
}
export async function generateStreamingRAGResponse({ message, chatbotId, userId }, supabaseClient) {
  const chatbot = await getChatbot(supabaseClient, chatbotId);
  const embeddingResponse = await generateEmbedding(message);
  const queryEmbedding = embeddingResponse.data[0].embedding;
  const retrievedChunks = await searchSimilarChunks(supabaseClient, queryEmbedding, chatbotId, {
    matchThreshold: 0.7,
    matchCount: 5
  });
  const context = retrievedChunks.map((chunk, i)=>`[${i + 1}] ${chunk.content}`).join('\n\n');
  const systemPrompt = buildSystemPrompt(chatbot.name, context, false);
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
function buildSystemPrompt(botName, context, enableCitations) {
  const basePrompt = `You are ${botName}, an AI assistant that ONLY answers questions based on the provided knowledge base.`;
  if (!context) {
    return `${basePrompt}

No knowledge base context was provided, so you cannot answer any questions.

Instructions:
- Do NOT answer questions.
- Respond with: "I'm sorry, I don't have any information available to answer that question."
- DO NOT try to be helpful beyond this.`;
  }
  const contextSection = `Knowledge Base Context:
${context}

Instructions:
- ONLY answer questions using the provided knowledge base.
- DO NOT use any external knowledge.
- If the context does NOT contain relevant information to a question (including follow-ups), reply with:
  "I'm sorry, I can only answer questions based on the knowledge provided to me."
- DO NOT infer or assume anything not clearly stated in the context.
- Treat each user message independently unless it's clearly related to the prior one **AND** the context supports it.
- DO NOT try to remember previous messages unless they are relevant **and** supported by the context.
- Be friendly and clear, but remain strictly limited to the context.
${enableCitations ? '- When referencing information, mention it comes from the knowledge base.' : ''}
`;
  return `${basePrompt}

${contextSection}`;
}
function estimatePromptTokens(messages) {
  const total = messages.map((m)=>m.content).join(' ');
  return Math.ceil(total.length / 4) + messages.length * 10;
}
