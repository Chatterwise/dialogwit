export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export function createErrorResponse(
  message: string,
  status: number = 500,
  details?: any
): Response {
  const errorBody = {
    error: message,
    ...(details && { details })
  }

  return new Response(
    JSON.stringify(errorBody),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

export function createSuccessResponse(data: any): Response {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

export function createCorsResponse(): Response {
  return new Response('ok', { headers: corsHeaders })
}

export function validateRequestBody<T>(
  body: any,
  requiredFields: (keyof T)[]
): T {
  for (const field of requiredFields) {
    if (!body[field]) {
      throw new Error(`Missing required field: ${String(field)}`)
    }
  }
  return body as T
}