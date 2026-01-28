// Cloudflare Pages Function - Create Polar Checkout Session (v2)

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
      return new Response(JSON.stringify({ error: 'Invalid tier', detail: `tier=${tier}` }), {
        status: 400, headers: corsHeaders
      });
    }

    const polarToken = env.POLAR_ACCESS_TOKEN;
    if (!polarToken) {
      return new Response(JSON.stringify({ error: 'POLAR_ACCESS_TOKEN not set' }), {
        status: 503, headers: corsHeaders
      });
    }

    const isSandbox = env.POLAR_SANDBOX === 'true';
    const apiBase = isSandbox
      ? 'https://sandbox-api.polar.sh'
      : 'https://api.polar.sh';

    const checkoutBody = {
      products: [productId],
      success_url: successUrl || `${new URL(request.url).origin}/result.html`,
    };

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
      const errorText = await response.text();
      console.error('Polar API Error:', response.status, errorText);
      return new Response(JSON.stringify({
        error: 'Polar API error',
        status: response.status,
        detail: errorText,
        sandbox: isSandbox,
        endpoint: `${apiBase}/v1/checkouts/`,
        body: checkoutBody
      }), {
        status: 502, headers: corsHeaders
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
    return new Response(JSON.stringify({ error: error.message }), {
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
