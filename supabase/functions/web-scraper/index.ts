import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: "Missing url parameter" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic URL validation
    if (!/^https?:\/\//i.test(url)) {
      return new Response(
        JSON.stringify({ error: "Invalid URL (must start with http/https)" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SSRF protection - block local/internal addresses
    const forbidden = ["127.0.0.1", "localhost", "192.168.", "10.", "172.", "0.0.0.0"];
    for (const f of forbidden) {
      if (url.includes(f)) {
        return new Response(
          JSON.stringify({ error: "Fetching local/internal addresses is blocked" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('Fetching URL:', url);

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (ThingBigAI/1.0)",
      },
    });

    if (!response.ok) {
      console.error('Fetch failed:', response.status);
      return new Response(
        JSON.stringify({ error: `Upstream fetch failed with status ${response.status}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    console.log('Successfully fetched content, length:', html.length);

    return new Response(
      JSON.stringify({ 
        content: html, 
        fetchedUrl: url 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in web-scraper function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to fetch URL" 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});