import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting: Simple in-memory store (resets on function cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
};

// SSRF protection: Block requests to local/internal IPs and dangerous protocols
const isInternalIP = (hostname: string): boolean => {
  const internalPatterns = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^::1$/,
    /^fe80:/i,
    /^fc00:/i,
    /^0\.0\.0\.0$/,
  ];
  
  return internalPatterns.some(pattern => pattern.test(hostname));
};

const validateUrl = (url: string): { valid: boolean; error?: string } => {
  // Check URL length
  if (url.length > 500) {
    return { valid: false, error: "URL too long (max 500 characters)" };
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  // Only allow http and https
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return { valid: false, error: "Only HTTP and HTTPS protocols are allowed" };
  }

  // Block internal IPs
  if (isInternalIP(parsedUrl.hostname)) {
    return { valid: false, error: "Access to internal addresses is not allowed" };
  }

  return { valid: true };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting based on IP
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    if (!checkRateLimit(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Comprehensive URL validation
    const validation = validateUrl(url);
    if (!validation.valid) {
      console.log(`URL validation failed: ${validation.error}`);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Fetching URL:', url);

    // Fetch with timeout (10 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ThingBigAI/1.0)',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        return new Response(
          JSON.stringify({ error: `Failed to fetch URL: ${response.statusText}` }),
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Limit response size to 5MB
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: 'Response too large (max 5MB)' }),
          { 
            status: 413, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const html = await response.text();
      console.log('Successfully fetched content, length:', html.length);

      return new Response(
        JSON.stringify({ html, fetchedUrl: url }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request timeout');
        return new Response(
          JSON.stringify({ error: 'Request timeout - the webpage took too long to respond' }),
          { 
            status: 504, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in web-scraper:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred while processing your request' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
