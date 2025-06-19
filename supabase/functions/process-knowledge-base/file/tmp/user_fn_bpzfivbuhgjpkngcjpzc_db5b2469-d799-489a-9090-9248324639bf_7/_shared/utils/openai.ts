import OpenAI from 'https://esm.sh/openai@4.24.1';
export class OpenAIError extends Error {
  code;
  constructor(message, code){
    super(message);
    this.code = code;
    this.name = 'OpenAIError';
  }
}
let openaiClient = null;
function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new OpenAIError('OpenAI API key not configured', 'missing_api_key');
    }
    openaiClient = new OpenAI({
      apiKey
    });
  }
  return openaiClient;
}
export async function createChatCompletion(messages, options = {}) {
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: options.model || 'gpt-3.5-turbo',
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      stream: false
    });
    const choice = response.choices[0];
    if (!choice?.message?.content) {
      throw new OpenAIError('No content in OpenAI response');
    }
    // Extract token usage from response
    const usage = {
      prompt_tokens: response.usage?.prompt_tokens || 0,
      completion_tokens: response.usage?.completion_tokens || 0,
      total_tokens: response.usage?.total_tokens || 0
    };
    return {
      content: choice.message.content,
      usage
    };
  } catch (error) {
    if (error instanceof OpenAIError) {
      throw error;
    }
    // Handle OpenAI API errors
    if (error.status === 401) {
      throw new OpenAIError('Invalid OpenAI API key', 'invalid_api_key');
    } else if (error.status === 429) {
      throw new OpenAIError('OpenAI rate limit exceeded', 'rate_limit_exceeded');
    } else if (error.status === 500) {
      throw new OpenAIError('OpenAI service error', 'service_error');
    }
    throw new OpenAIError(`OpenAI API error: ${error.message}`, 'api_error');
  }
}
export async function streamChatCompletion(messages, options = {}) {
  try {
    const client = getOpenAIClient();
    const stream = await client.chat.completions.create({
      model: options.model || 'gpt-3.5-turbo',
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      stream: true
    });
    let totalTokens = 0;
    let promptTokens = 0;
    let completionTokens = 0;
    const readableStream = new ReadableStream({
      async start (controller) {
        try {
          for await (const chunk of stream){
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(delta);
            }
            // Track usage if available in chunk
            if (chunk.usage) {
              promptTokens = chunk.usage.prompt_tokens || 0;
              completionTokens = chunk.usage.completion_tokens || 0;
              totalTokens = chunk.usage.total_tokens || 0;
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
    const usagePromise = new Promise((resolve)=>{
      // For streaming, we'll estimate tokens if not provided
      // This is a fallback - actual usage should come from the stream
      setTimeout(()=>{
        resolve({
          prompt_tokens: promptTokens || estimateTokens(messages.map((m)=>m.content).join(' ')),
          completion_tokens: completionTokens || 0,
          total_tokens: totalTokens || promptTokens + completionTokens
        });
      }, 100);
    });
    return {
      stream: readableStream,
      usage: usagePromise
    };
  } catch (error) {
    if (error instanceof OpenAIError) {
      throw error;
    }
    if (error.status === 401) {
      throw new OpenAIError('Invalid OpenAI API key', 'invalid_api_key');
    } else if (error.status === 429) {
      throw new OpenAIError('OpenAI rate limit exceeded', 'rate_limit_exceeded');
    }
    throw new OpenAIError(`OpenAI streaming error: ${error.message}`, 'streaming_error');
  }
}
export async function createEmbedding(text, options = {}) {
  try {
    const client = getOpenAIClient();
    const response = await client.embeddings.create({
      model: options.model || 'text-embedding-ada-002',
      input: text
    });
    const embedding = response.data[0]?.embedding;
    if (!embedding) {
      throw new OpenAIError('No embedding in OpenAI response');
    }
    // Extract token usage from response
    const usage = {
      prompt_tokens: response.usage?.prompt_tokens || 0,
      total_tokens: response.usage?.total_tokens || 0
    };
    return {
      embedding,
      usage
    };
  } catch (error) {
    if (error instanceof OpenAIError) {
      throw error;
    }
    if (error.status === 401) {
      throw new OpenAIError('Invalid OpenAI API key', 'invalid_api_key');
    } else if (error.status === 429) {
      throw new OpenAIError('OpenAI rate limit exceeded', 'rate_limit_exceeded');
    }
    throw new OpenAIError(`OpenAI embedding error: ${error.message}`, 'embedding_error');
  }
}
export async function createEmbeddings(texts, options = {}) {
  const batchSize = options.batchSize || 20 // Process in batches to avoid rate limits
  ;
  const allEmbeddings = [];
  let totalUsage = {
    prompt_tokens: 0,
    total_tokens: 0
  };
  // Process texts in batches
  for(let i = 0; i < texts.length; i += batchSize){
    const batch = texts.slice(i, i + batchSize);
    try {
      const client = getOpenAIClient();
      const response = await client.embeddings.create({
        model: options.model || 'text-embedding-ada-002',
        input: batch
      });
      // Collect embeddings from this batch
      const batchEmbeddings = response.data.map((item)=>item.embedding);
      allEmbeddings.push(...batchEmbeddings);
      // Accumulate usage
      if (response.usage) {
        totalUsage.prompt_tokens += response.usage.prompt_tokens || 0;
        totalUsage.total_tokens += response.usage.total_tokens || 0;
      }
      // Add delay between batches to respect rate limits
      if (i + batchSize < texts.length) {
        await new Promise((resolve)=>setTimeout(resolve, 100));
      }
    } catch (error) {
      if (error instanceof OpenAIError) {
        throw error;
      }
      if (error.status === 401) {
        throw new OpenAIError('Invalid OpenAI API key', 'invalid_api_key');
      } else if (error.status === 429) {
        throw new OpenAIError('OpenAI rate limit exceeded', 'rate_limit_exceeded');
      }
      throw new OpenAIError(`OpenAI batch embedding error: ${error.message}`, 'batch_embedding_error');
    }
  }
  return {
    embeddings: allEmbeddings,
    usage: totalUsage
  };
}
// Utility function to estimate tokens (rough approximation)
export function estimateTokens(text) {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}
// Utility function to estimate cost based on token usage
export function estimateCost(usage, model = 'gpt-3.5-turbo') {
  // Pricing per 1K tokens (as of 2024)
  const pricing = {
    'gpt-3.5-turbo': {
      input: 0.0015,
      output: 0.002
    },
    'gpt-4': {
      input: 0.03,
      output: 0.06
    },
    'text-embedding-ada-002': {
      input: 0.0001,
      output: 0
    }
  };
  const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
  const inputCost = usage.prompt_tokens / 1000 * modelPricing.input;
  const outputCost = (usage.completion_tokens || 0) / 1000 * modelPricing.output;
  return inputCost + outputCost;
}
