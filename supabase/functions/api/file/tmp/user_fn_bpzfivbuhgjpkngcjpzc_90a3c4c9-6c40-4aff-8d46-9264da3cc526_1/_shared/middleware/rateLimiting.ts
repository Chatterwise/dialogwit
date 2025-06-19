import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
export class RateLimiter {
  supabase;
  constructor(supabaseUrl, supabaseKey){
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
  async checkRateLimit(identifier, endpoint, config = {}) {
    const { requests_per_minute = 100, requests_per_hour = 1000, requests_per_day = 10000, burst_limit = 20, enabled = true } = config;
    if (!enabled) {
      return {
        allowed: true,
        remaining: requests_per_minute,
        resetTime: new Date(Date.now() + 60000)
      };
    }
    // Check if currently blocked
    const { data: existingLimit } = await this.supabase.from('rate_limits').select('*').eq('identifier', identifier).eq('endpoint', endpoint).single();
    const now = new Date();
    // Check if blocked
    if (existingLimit?.blocked_until && new Date(existingLimit.blocked_until) > now) {
      const retryAfter = Math.ceil((new Date(existingLimit.blocked_until).getTime() - now.getTime()) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(existingLimit.blocked_until),
        retryAfter
      };
    }
    // Check minute window
    const minuteResult = await this.checkWindow(identifier, endpoint, 'minute', requests_per_minute, 60 * 1000);
    if (!minuteResult.allowed) {
      await this.blockIdentifier(identifier, endpoint, 5 * 60 * 1000) // Block for 5 minutes
      ;
      return minuteResult;
    }
    // Check hour window
    const hourResult = await this.checkWindow(identifier, endpoint, 'hour', requests_per_hour, 60 * 60 * 1000);
    if (!hourResult.allowed) {
      await this.blockIdentifier(identifier, endpoint, 60 * 60 * 1000) // Block for 1 hour
      ;
      return hourResult;
    }
    // Check day window
    const dayResult = await this.checkWindow(identifier, endpoint, 'day', requests_per_day, 24 * 60 * 60 * 1000);
    if (!dayResult.allowed) {
      await this.blockIdentifier(identifier, endpoint, 24 * 60 * 60 * 1000) // Block for 24 hours
      ;
      return dayResult;
    }
    // All checks passed, increment counter
    await this.incrementCounter(identifier, endpoint);
    return {
      allowed: true,
      remaining: Math.min(minuteResult.remaining, hourResult.remaining, dayResult.remaining),
      resetTime: new Date(now.getTime() + 60000) // Next minute
    };
  }
  async checkWindow(identifier, endpoint, window, limit, windowMs) {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);
    // Count requests in window
    const { data: requests, error } = await this.supabase.from('rate_limits').select('requests_count').eq('identifier', identifier).eq('endpoint', endpoint).gte('window_start', windowStart.toISOString());
    if (error) {
      console.error('Rate limit check error:', error);
      // Fail open - allow request if we can't check
      return {
        allowed: true,
        remaining: limit,
        resetTime: new Date(now.getTime() + windowMs)
      };
    }
    const totalRequests = requests?.reduce((sum, r)=>sum + r.requests_count, 0) || 0;
    const remaining = Math.max(0, limit - totalRequests);
    return {
      allowed: totalRequests < limit,
      remaining,
      resetTime: new Date(now.getTime() + windowMs)
    };
  }
  async incrementCounter(identifier, endpoint) {
    const now = new Date();
    const windowStart = new Date(Math.floor(now.getTime() / 60000) * 60000) // Round to minute
    ;
    await this.supabase.from('rate_limits').upsert({
      identifier,
      endpoint,
      requests_count: 1,
      window_start: windowStart.toISOString(),
      window_duration: '1 minute',
      limit_value: 100,
      updated_at: now.toISOString()
    }, {
      onConflict: 'identifier,endpoint,window_start',
      ignoreDuplicates: false
    }).then(({ data, error })=>{
      if (error) {
        // If upsert failed, try increment
        return this.supabase.rpc('increment_rate_limit', {
          p_identifier: identifier,
          p_endpoint: endpoint,
          p_window_start: windowStart.toISOString()
        });
      }
    });
  }
  async blockIdentifier(identifier, endpoint, blockDurationMs) {
    const blockedUntil = new Date(Date.now() + blockDurationMs);
    await this.supabase.from('rate_limits').upsert({
      identifier,
      endpoint,
      blocked_until: blockedUntil.toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  async getRateLimitStatus(identifier, endpoint) {
    const { data } = await this.supabase.from('rate_limits').select('*').eq('identifier', identifier).eq('endpoint', endpoint).order('created_at', {
      ascending: false
    }).limit(10);
    return data || [];
  }
  async clearRateLimit(identifier, endpoint) {
    let query = this.supabase.from('rate_limits').delete().eq('identifier', identifier);
    if (endpoint) {
      query = query.eq('endpoint', endpoint);
    }
    await query;
  }
}
// Helper function to get client IP
export function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  return 'unknown';
}
// Rate limiting middleware for edge functions
export async function withRateLimit(request, endpoint, config = {}, handler) {
  const rateLimiter = new RateLimiter(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const clientIP = getClientIP(request);
  const result = await rateLimiter.checkRateLimit(clientIP, endpoint, config);
  // Add rate limit headers
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', config.requests_per_minute?.toString() || '100');
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime.getTime() / 1000).toString());
  if (!result.allowed) {
    headers.set('Retry-After', result.retryAfter?.toString() || '60');
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded',
      message: `Too many requests. Try again in ${result.retryAfter || 60} seconds.`,
      retryAfter: result.retryAfter || 60
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(headers.entries())
      }
    });
  }
  // Execute the handler and add rate limit headers to response
  const response = await handler();
  // Add rate limit headers to successful response
  for (const [key, value] of headers.entries()){
    response.headers.set(key, value);
  }
  return response;
}
