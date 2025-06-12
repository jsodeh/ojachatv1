/// <reference types="https://deno.land/x/supabase@1.3.1/mod.ts" />

// @deno-types="https://raw.githubusercontent.com/denoland/deno/v1.x/cli/dts/lib.deno.d.ts"

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0'
import { corsHeaders } from '../_shared/cors.ts'

interface GenerateHintsRequest {
  location: {
    latitude: number
    longitude: number
  }
  chatHistory: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

// Default hints when no location data is available
const DEFAULT_HINTS = [
  "Ask about market prices in your area",
  "Find local vendors and markets",
  "Check today's best deals",
  "Compare prices across markets",
  "Discover seasonal produce"
]

// Format location context for better prompt engineering
function formatLocationContext(documents: any[]) {
  if (!documents?.length) return ''
  
  return documents
    .map(doc => doc.content)
    .filter(Boolean)
    .map(content => `- ${content}`)
    .join('\n')
}

// Format chat history for context
function formatChatContext(history: GenerateHintsRequest['chatHistory']) {
  if (!history?.length) return ''
  
  return history
    .slice(-3) // Only use last 3 messages for context
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { location, chatHistory } = await req.json() as GenerateHintsRequest

    // First, get relevant documents with location and metadata
    const { data: documents, error: docError } = await supabaseClient
      .from('documents')
      .select(`
        content,
        metadata->location_name as market_name,
        metadata->market_type as market_type,
        metadata->last_updated
      `)
      .filter('location', 'near', {
        latitude: location.latitude,
        longitude: location.longitude,
        distance: 10000 // 10km radius for better coverage
      })
      .order('metadata->last_updated', { ascending: false })
      .limit(10)

    if (docError) {
      console.error('Error fetching documents:', docError)
      throw docError
    }

    // Get recent market activity from chat history
    const recentMarketQueries = chatHistory
      .slice(-5)
      .filter(msg => msg.role === 'user' && 
        (msg.content.toLowerCase().includes('market') || 
         msg.content.toLowerCase().includes('price') ||
         msg.content.toLowerCase().includes('vendor')))

    const openai = new OpenAIApi(new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    }))

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Generate 5 engaging, location-specific hint texts for a market information chat interface.
          
Available markets and data:
${documents?.map(doc => `- ${doc.market_name || 'Local market'} (${doc.market_type || 'General'})`).join('\n') || 'No specific market data available'}

Recent user interests:
${recentMarketQueries.map(q => `- ${q.content}`).join('\n') || 'No recent market queries'}

Guidelines:
- Each hint should be under 50 characters
- Include specific market names when available
- Focus on prices, availability, and deals
- Make hints actionable and engaging
- Vary the types of hints for better engagement`
        },
        {
          role: 'user',
          content: 'Generate 5 short, engaging hints based on the available market data and user interests.'
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    })

    const generatedHints = completion.data.choices[0].message?.content
      ?.split('\n')
      ?.filter(hint => hint.trim().length > 0)
      ?.slice(0, 5) || []

    // Use generated hints if available, otherwise fall back to defaults
    const hints = generatedHints.length > 0 ? generatedHints : DEFAULT_HINTS

    return new Response(
      JSON.stringify({
        hints,
        hasLocationContext: documents?.length > 0,
        nearbyMarkets: documents?.map(doc => doc.market_name).filter(Boolean) || [],
        marketTypes: [...new Set(documents?.map(doc => doc.market_type).filter(Boolean) || [])]
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error generating hints:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        hints: DEFAULT_HINTS,
        hasLocationContext: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 