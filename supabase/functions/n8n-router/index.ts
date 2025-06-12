// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

// Allowed origins for CORS
const allowedOrigins = [
  'http://172.20.96.1:8080',     // Local development
  'http://localhost:8080',        // Local development alternative
  'https://ojachat.app',          // Production domain
  'https://www.ojachat.app'       // Production www subdomain
];

// Function to get CORS headers based on request origin
const getCorsHeaders = (requestOrigin: string | null) => {
  // If the request origin is in our allowed list, return it, otherwise return first allowed origin as fallback
  const origin = requestOrigin && allowedOrigins.includes(requestOrigin) 
    ? requestOrigin 
    : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, testauth',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };
};

interface WebhookRequest {
  method: string;
  headers: Headers;
  url: string;
  body?: any;
}

// Get N8N_WEBHOOK_URL from environment variables
const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL');

if (!N8N_WEBHOOK_URL) {
  console.error('N8N_WEBHOOK_URL environment variable not set.');
  // Exit the process or handle this error appropriately in a production environment
}

console.log("n8n-router function started");

serve(async (req) => {
  const requestStart = Date.now();
  
  try {
    // Get origin-specific CORS headers
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Parse request
    const url = new URL(req.url);
    const webhookPath = url.pathname.replace('/n8n-router', '');
    
    // Log incoming request details
    console.log(`Processing request to ${webhookPath}`);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Forward headers
    const headers = new Headers(req.headers);
    
    // Get request body if it exists
    let body;
    if (req.body) {
      const bodyText = await req.text();
      console.log('Request body:', bodyText);
      body = bodyText;
    }

    // Forward the request to n8n with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    try {
      console.log('Forwarding request to:', N8N_WEBHOOK_URL || 'N8N_WEBHOOK_URL not set');
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: req.method,
        headers: headers,
        body: body,
        signal: controller.signal
      });

      clearTimeout(timeout);

      // Log response details
      console.log('N8N Response Status:', response.status);
      const responseBody = await response.text();
      console.log('N8N Response body:', responseBody);
      
      if (!responseBody) {
        console.error('Empty response body received from n8n');
        return new Response(JSON.stringify({ 
          error: 'Empty response from n8n service',
          details: 'The n8n service returned an empty response. Please check the n8n webhook configuration.'
        }), {
          status: 502,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }

      try {
        // Try to parse the response as JSON
        const jsonResponse = JSON.parse(responseBody);
        return new Response(JSON.stringify(jsonResponse), {
          status: response.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        // Return the raw response if it's not JSON
        return new Response(responseBody, {
          status: response.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/plain'
          }
        });
      }
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.error('Request to n8n timed out');
        return new Response(JSON.stringify({ error: 'Request timed out' }), {
          status: 504,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process request',
      message: error.message 
    }), {
      status: 500,
      headers: {
        ...getCorsHeaders(req.headers.get('origin')),
        'Content-Type': 'application/json'
      }
    });
  } finally {
    // Log request duration
    const duration = Date.now() - requestStart;
    console.log(`Request processed in ${duration}ms`);
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/n8n-router' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"sessionId": "test-session", "chatInput": "Hello!"}'

*/
