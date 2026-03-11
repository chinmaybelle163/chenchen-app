export async function onRequestPost(context) {
  const { message } = await context.request.json();
  const apiKey = context.env.COZE_API_KEY;

  const res = await fetch('https://api.coze.cn/open_api/v2/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bot_id: '7611413960864792617',
      user: 'chenchen-app-user',
      query: message,
      stream: true,
    }),
  });

  // 直接把 Coze 的 stream 透传给前端
  return new Response(res.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
