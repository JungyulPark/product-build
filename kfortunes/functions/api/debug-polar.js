// TEMPORARY debug endpoint - remove after fixing
export async function onRequestGet(context) {
  const { env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  const polarToken = env.POLAR_ACCESS_TOKEN;
  const isSandbox = env.POLAR_SANDBOX === 'true';
  const apiBase = isSandbox ? 'https://sandbox-api.polar.sh' : 'https://api.polar.sh';

  if (!polarToken) {
    return new Response(JSON.stringify({ error: 'No token' }), { status: 503, headers: corsHeaders });
  }

  try {
    // Check token by fetching current user/org
    const orgRes = await fetch(`${apiBase}/v1/organizations`, {
      headers: { 'Authorization': `Bearer ${polarToken}` }
    });
    const orgData = await orgRes.json();

    // Try to fetch the product directly
    const productRes = await fetch(`${apiBase}/v1/products/ee9f5667-ab30-4932-8c40-f4fe8e2b2eb8`, {
      headers: { 'Authorization': `Bearer ${polarToken}` }
    });
    const productData = await productRes.json();

    return new Response(JSON.stringify({
      sandbox: isSandbox,
      apiBase,
      tokenPrefix: polarToken.substring(0, 8) + '...',
      orgStatus: orgRes.status,
      organizations: orgData,
      productStatus: productRes.status,
      product: productData
    }, null, 2), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}
