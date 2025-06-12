import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { record: order } = await req.json();

    if (!order || !order.user_id || !order.id || !order.total_amount) {
      return new Response(JSON.stringify({ error: 'Invalid order data received' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID');
    const oneSignalApiKey = Deno.env.get('ONESIGNAL_API_KEY');

    if (!oneSignalAppId || !oneSignalApiKey) {
      console.error("OneSignal App ID or API Key not set in environment variables.");
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const notification = {
      app_id: oneSignalAppId,
      include_external_user_ids: [String(order.user_id)], // Assuming user_id is used as external_user_id in OneSignal
      contents: {
        en: `Your order #${order.id} for $${order.total_amount} has been placed successfully!`,
      },
      // Add other parameters as needed, e.g., headings, data, etc.
      // headings: { en: "Order Confirmed!" },
      // data: { order_id: order.id },
    };

    const oneSignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${oneSignalApiKey}`,
      },
      body: JSON.stringify(notification),
    });

    const responseData = await oneSignalResponse.json();

    if (!oneSignalResponse.ok) {
      console.error('Error sending OneSignal notification:', responseData);
      return new Response(JSON.stringify({ error: 'Failed to send push notification', details: responseData }), {
        status: oneSignalResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('OneSignal notification sent successfully:', responseData);

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing order notification:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});