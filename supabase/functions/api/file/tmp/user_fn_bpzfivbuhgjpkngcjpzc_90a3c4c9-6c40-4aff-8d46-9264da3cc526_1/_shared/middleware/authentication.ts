import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
export class AuthenticationError extends Error {
  constructor(message){
    super(message);
    this.name = 'AuthenticationError';
  }
}
export async function authenticateRequest(req, supabaseUrl, supabaseServiceKey) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid authorization header');
  }
  const token = authHeader.substring(7) // Remove 'Bearer ' prefix
  ;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      throw new AuthenticationError('Invalid or expired token');
    }
    return {
      user,
      isAuthenticated: true,
      userId: user.id
    };
  } catch (error) {
    throw new AuthenticationError('Authentication failed');
  }
}
export function requireAuth(authContext) {
  if (!authContext.isAuthenticated || !authContext.userId) {
    throw new AuthenticationError('Authentication required');
  }
}
export async function validateApiKey(apiKey, supabaseUrl, supabaseServiceKey) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  // Hash the API key for lookup
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const keyHash = hashArray.map((b)=>b.toString(16).padStart(2, '0')).join('');
  const { data: apiKeyData, error } = await supabase.from('api_keys').select('id, user_id, active, expires_at').eq('key_hash', keyHash).eq('active', true).single();
  if (error || !apiKeyData) {
    throw new AuthenticationError('Invalid API key');
  }
  // Check if key is expired
  if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
    throw new AuthenticationError('API key has expired');
  }
  // Update last used timestamp
  await supabase.from('api_keys').update({
    last_used_at: new Date().toISOString(),
    usage_count: supabase.rpc('increment_usage_count', {
      key_id: apiKeyData.id
    })
  }).eq('id', apiKeyData.id);
  return {
    userId: apiKeyData.user_id,
    keyId: apiKeyData.id
  };
}
