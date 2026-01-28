// Cloudflare Pages Function - Create Polar Checkout Session
// Creates a checkout session for AI Analysis or Compatibility products

const PRODUCTS = {
  basic: '066396ed-5c5e-46f7-8d71-8d0ca7863b9c',
  compatibility: 'adc1562e-875f-4ea9-816f-12780a3305e8'
};

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const { tier, successUrl, embedOrigin } = body;

    const productId = PRODUCTS[tier];
    if (!productId) {
      return new Response(JSON.stringify({ error: 'Invalid tier' }), {
        status: 400, headers: corsHeaders
      });
    }

    const polarToken = env.POLAR_ACCESS_TOKEN;
    if (!polarToken) {
      return new Response(JSON.stringify({ error: 'Payment system not configured' }), {
        status: 503, headers: corsHeaders
      });
    }

    // Determine API base (sandbox vs production)
    const apiBase = env.POLAR_SANDBOX === 'true'
      ? 'https://sandbox-api.polar.sh'
      : 'https://api.polar.sh';

    const checkoutBody = {
      product_id: productId,
      success_url: successUrl || `${new URL(request.url).origin}/result.html`,
    };

    // If embed origin provided, include it for iframe communication
    if (embedOrigin) {
      checkoutBody.embed_origin = embedOrigin;
    }

    const response = await fetch(`${apiBase}/v1/checkouts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${polarToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkoutBody)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Polar API Error:', response.status, error);
      return new Response(JSON.stringify({ error: 'Failed to create checkout' }), {
        status: 500, headers: corsHeaders
      });
    }

    const checkout = await response.json();

    return new Response(JSON.stringify({
      success: true,
      checkoutUrl: checkout.url,
      checkoutId: checkout.id
    }), {
      status: 200, headers: corsHeaders
    });

  } catch (error) {
    console.error('Checkout Error:', error.message);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: corsHeaders
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
