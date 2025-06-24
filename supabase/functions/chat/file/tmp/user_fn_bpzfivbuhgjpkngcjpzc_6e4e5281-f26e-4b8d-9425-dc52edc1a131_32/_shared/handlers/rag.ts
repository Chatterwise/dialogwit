import { generateEmbedding, generateChatCompletion, streamChatCompletion, OpenAIError } from '../utils/openai.ts';
import { searchSimilarChunks, fallbackTextSearch } from '../utils/database.ts';

export const DEFAULT_OPTIONS = {
  enableCitations: false,
  maxRetrievedChunks: 3,
  similarityThreshold: 0.7,
  enableStreaming: false,
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 500,
  chunkCharLimit: 200,
  minWordCount: 5,
  stopwords: ['hi', 'hello', 'hey', 'yo', 'hola', 'ok', 'okay', 'hmm', 'yes', 'no']
};

export async function generateRAGResponse(message, botId, supabaseClient, options = {}, userId) {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };
  const { enableCitations, maxRetrievedChunks, similarityThreshold, enableStreaming, model, temperature, maxTokens, chunkCharLimit, stopwords, minWordCount } = finalOptions;

  const { data: chatbot, error: botError } = await supabaseClient.from('chatbots').select('*, bot_role_templates(*), rag_settings(*)').eq('id', botId).single();
  if (botError || !chatbot) throw new Error('Chatbot not found');

  const wordCount = message.trim().split(/\s+/).length;
  const normalizedMessage = message.trim().toLowerCase();
  if (wordCount <= minWordCount || stopwords.includes(normalizedMessage)) {
    return { response: "Could you please provide a bit more detail so I can assist better?", citations_enabled: false };
  }

  let retrievedChunks = [];
  let context = '';
  try {
    const embeddingResponse = await generateEmbedding(message);
    const queryEmbedding = embeddingResponse.data[0].embedding;
    retrievedChunks = await searchSimilarChunks(supabaseClient, queryEmbedding, botId, { matchThreshold: similarityThreshold, matchCount: maxRetrievedChunks });
    if (retrievedChunks.length > 0) {
      context = retrievedChunks.map((chunk, index) => `Chunk [${index + 1}]: ${chunk.content.slice(0, chunkCharLimit)}`).join('\n\n');
    }
  } catch (error) {
    if (error instanceof OpenAIError) throw error;
    const fallbackChunks = await fallbackTextSearch(supabaseClient, message, botId);
    if (fallbackChunks.length > 0) {
      context = fallbackChunks.map((chunk, index) => `Chunk [${index + 1}]: ${chunk.content.slice(0, chunkCharLimit)}`).join('\n\n');
    }
  }

  const systemPrompt = buildSystemPrompt(chatbot.name, context, enableCitations, chatbot.bot_role_templates?.system_instructions);
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ];

  if (enableStreaming) {
    throw new Error('Streaming is only supported via generateStreamingRAGResponse(). Please call that instead.');
  }

  const chatResponse = await generateChatCompletion(messages, { model, temperature, max_tokens: maxTokens });
  const responseText = chatResponse.choices?.[0]?.message?.content || 'I apologize, but I encountered an error processing your request.';

  const totalTokens = chatResponse.usage?.total_tokens ?? estimatePromptTokens(messages) + Math.ceil(responseText.length / 4);
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
    if (error) console.error('Error tracking token usage:', error);
  }

  const ragResponse = {
    response: responseText,
    citations_enabled: enableCitations
  };

  if (enableCitations && retrievedChunks.length > 0) {
    ragResponse.sources = retrievedChunks.map(chunk => ({
      content: chunk.content.slice(0, 200) + '...',
      similarity: chunk.similarity,
      chunk_index: chunk.chunk_index,
      source_url: chunk.source_url
    }));
  }

  return ragResponse;
}

export async function generateStreamingRAGResponse({ message, chatbotId, userId, userIp = 'unknown' }, supabaseClient, options = {}) {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };
  const { similarityThreshold, maxRetrievedChunks, chunkCharLimit, model, temperature, maxTokens, stopwords, minWordCount } = finalOptions;

  const { data: chatbot, error: botError } = await supabaseClient.from('chatbots').select('*, bot_role_templates(*), rag_settings(*)').eq('id', chatbotId).single();
  if (botError || !chatbot) throw new Error('Chatbot not found');

  const wordCount = message.trim().split(/\s+/).length;
  const normalizedMessage = message.trim().toLowerCase();
  if (wordCount <= minWordCount || stopwords.includes(normalizedMessage)) {
    const fullResponse = "Could you please provide a bit more detail so I can assist better?";
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(fullResponse));
        controller.close();
      }
    });
    queueMicrotask(() => saveStreamedMessage(supabaseClient, chatbotId, message, fullResponse, userIp));
    return {
      stream,
      fullResponse
    };
  }

  let retrievedChunks = [];
  let context = '';
  try {
    const embeddingResponse = await generateEmbedding(message);
    const queryEmbedding = embeddingResponse.data[0].embedding;
    retrievedChunks = await searchSimilarChunks(supabaseClient, queryEmbedding, chatbotId, { matchThreshold: similarityThreshold, matchCount: maxRetrievedChunks });
    if (retrievedChunks.length > 0) {
context = retrievedChunks.map((chunk, i) => `[${i + 1}] ${chunk.content.slice(0, chunkCharLimit)}`).join('\n\n');
    }
  } catch (error) {
    if (error instanceof OpenAIError) throw error;
    const fallbackChunks = await fallbackTextSearch(supabaseClient, message, chatbotId);
    context = fallbackChunks.map((chunk, i) => `[${i + 1}] ${chunk.content}`).join('\n\n');
  }

  const systemPrompt = buildSystemPrompt(chatbot.name, context, false, chatbot.bot_role_templates?.system_instructions);
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ];

  const encoder = new TextEncoder();
  let fullResponse = '';
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamChatCompletion(messages, { model, temperature, max_tokens: maxTokens })) {
          fullResponse += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();

        const estimatedPromptTokens = estimatePromptTokens(messages);
        const estimatedResponseTokens = Math.ceil(fullResponse.length / 4);
        const totalTokens = estimatedPromptTokens + estimatedResponseTokens;
        if (userId) {
          await supabaseClient.rpc('track_token_usage', {
            p_user_id: userId,
            p_chatbot_id: chatbotId,
            p_metric_name: 'chat_tokens_per_month',
            p_token_count: totalTokens,
            p_usage_source: 'chat',
            p_metadata: {
              message_length: message.length,
              response_length: fullResponse.length,
              context_chunks: retrievedChunks.length,
              model,
              estimated_tokens: totalTokens
            }
          });
        }
        await saveStreamedMessage(supabaseClient, chatbotId, message, fullResponse, userIp);
      } catch (err) {
        controller.error(err);
        console.error('Streaming error:', err);
      }
    },
    cancel(reason) {
      console.log('Stream cancelled:', reason);
    }
  });

  return {
    stream,
    fullResponse
  };
}

async function saveStreamedMessage(supabaseClient, chatbotId, message, response, userIp) {
  try {
    await supabaseClient.from('chat_messages').insert({
      chatbot_id: chatbotId,
      message,
      response,
      user_ip: userIp
    });
  } catch (err) {
    console.error('Error saving streamed chat message:', err);
  }
}

function buildSystemPrompt(botName, context, enableCitations, customInstructions) {
  if (!context) {
    return `You are ${botName}, an AI assistant using a strict internal knowledge base.\n\nNo relevant information found for the current query.\nReply: "Sorry, I don't have an answer based on the available knowledge."`;
  }
  return `You are ${botName}, an AI assistant.\n\nKnowledge Base:\n${context}\n\nInstructions:\n- Use only the provided knowledge base.\n- If no answer is found in context, say: "I don’t have the information to answer that right now based on my sources."\n${enableCitations ? '- Mention that your answers come from the knowledge base.' : ''}\n${customInstructions ? `- Additional Role Instructions:\n${customInstructions}` : ''}`;
}

function estimatePromptTokens(messages) {
  const total = messages.map((m) => m.content).join(' ');
  return Math.ceil(total.length / 4) + messages.length * 10;
}
