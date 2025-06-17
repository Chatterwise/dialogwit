import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export interface AuthContext {
  userId?: string
  apiKeyId?: string
  isAuthenticated: boolean
  authMethod: 'jwt' | 'api_key' | 'none'
}

export async function authenticateRequest(
  req: Request,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<AuthContext> {
  const authHeader = req.headers.get('Authorization')
  
  if (!authHeader) {
    throw new AuthenticationError('Missing Authorization header')
  }

  // Initialize Supabase client
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

  // Check for JWT token (Bearer token)
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    
    // Validate JWT token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      throw new AuthenticationError('Invalid JWT token')
    }
    
    return {
      userId: user.id,
      isAuthenticated: true,
      authMethod: 'jwt'
    }
  }
  
  // Check for API key
  if (authHeader.startsWith('ApiKey ')) {
    const apiKey = authHeader.replace('ApiKey ', '')
    
    // Validate API key
    const apiKeyData = await validateApiKey(apiKey, supabaseAdmin)
    
    if (!apiKeyData) {
      throw new AuthenticationError('Invalid API key')
    }
    
    return {
      userId: apiKeyData.user_id,
      apiKeyId: apiKeyData.id,
      isAuthenticated: true,
      authMethod: 'api_key'
    }
  }
  
  throw new AuthenticationError('Unsupported authentication method')
}

export async function validateApiKey(
  apiKey: string,
  supabaseClient: any
): Promise<any> {
  // In a real implementation, you would hash the API key and compare with stored hash
  // For simplicity, we're using a prefix-based lookup here
  
  // Get key prefix (first 8 chars)
  const keyPrefix = apiKey.substring(0, 8)
  
  // Find matching API key
  const { data, error } = await supabaseClient
    .from('api_keys')
    .select('*')
    .eq('key_prefix', keyPrefix)
    .eq('active', true)
    .single()
  
  if (error || !data) {
    return null
  }
  
  // In a real implementation, you would verify the full key hash here
  // For demo purposes, we're just checking the prefix
  
  // Check if key is expired
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null
  }
  
  // Update last used timestamp
  await supabaseClient
    .from('api_keys')
    .update({
      last_used_at: new Date().toISOString(),
      usage_count: data.usage_count + 1
    })
    .eq('id', data.id)
  
  return data
}