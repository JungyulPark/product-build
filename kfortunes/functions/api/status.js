// Cloudflare Pages Function - GPT Status Check
// Frontend uses this to determine whether GPT analysis is available

export async function onRequestGet(context) {
  const { env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  const gptEnabled = !!(env.OPENAI_API_KEY && env.MOCK_MODE !== 'true');

  return new Response(JSON.stringify({
    gptEnabled,
    tiers: {
      free: true,
      basic: gptEnabled,
      premium: false  // Not yet connected to frontend
    }
  }), {
    status: 200,
    headers: corsHeaders
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
