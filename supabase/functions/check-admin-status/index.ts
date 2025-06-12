import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  email: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the admin email from environment variables
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');
    
    if (!ADMIN_EMAIL) {
      console.error('ADMIN_EMAIL environment variable is not set');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error',
          isAdmin: false 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Parse the request body
    const body: RequestBody = await req.json();
    const { email } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ 
          error: 'Email is required',
          isAdmin: false 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Check if the provided email matches the admin email
    const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    // Return the result
    return new Response(
      JSON.stringify({ isAdmin }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error checking admin status:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        isAdmin: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}); 