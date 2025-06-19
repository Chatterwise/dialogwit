export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
export function createErrorResponse(message, status = 500, details) {
  const errorBody = {
    error: message,
    ...details && {
      details
    }
  };
  return new Response(JSON.stringify(errorBody), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
export function createSuccessResponse(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
export function createCorsResponse() {
  return new Response('ok', {
    headers: corsHeaders
  });
}
export function validateRequestBody(body, requiredFields) {
  for (const field of requiredFields){
    if (!body[field]) {
      throw new Error(`Missing required field: ${String(field)}`);
    }
  }
  return body;
}
