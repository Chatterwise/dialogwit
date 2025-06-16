import { OpenAIEmbeddingResponse, OpenAIChatResponse } from '../types.ts'

export class OpenAIError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'OpenAIError'
  }
}

export function validateOpenAIKey(): string {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    throw new OpenAIError('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.')
  }
  return apiKey
}

export async function generateEmbedding(
  input: string | string[],
  model: string = 'text-embedding-ada-002'
): Promise<OpenAIEmbeddingResponse> {
  const apiKey = validateOpenAIKey()
  
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input,
      model
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new OpenAIError(
      `OpenAI Embeddings API failed: ${response.status} - ${errorText}`,
      response.status
    )
  }

  return await response.json()
}

export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  options: {
    model?: string
    max_tokens?: number
    temperature?: number
    stream?: boolean
  } = {}
): Promise<OpenAIChatResponse | ReadableStream> {
  const apiKey = validateOpenAIKey()
  
  const {
    model = 'gpt-3.5-turbo',
    max_tokens = 500,
    temperature = 0.7,
    stream = false
  } = options

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens,
      temperature,
      stream
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new OpenAIError(
      `OpenAI Chat API failed: ${response.status} - ${errorText}`,
      response.status
    )
  }

  if (stream) {
    return response.body!
  }

  return await response.json()
}

export async function* streamChatCompletion(
  messages: Array<{ role: string; content: string }>,
  options: {
    model?: string
    max_tokens?: number
    temperature?: number
  } = {}
): AsyncGenerator<string, void, unknown> {
  const stream = await generateChatCompletion(messages, { ...options, stream: true }) as ReadableStream
  const reader = stream.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(line => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') return

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              yield content
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}