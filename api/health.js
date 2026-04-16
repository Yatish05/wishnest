export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const start = Date.now();
  
  const data = {
    success: true,
    status: 'ok',
    uptime: process.uptime ? process.uptime() : null, // process.uptime might not be available in Edge
    timestamp: new Date().toISOString(),
    region: req.headers.get('x-vercel-id') || 'unknown',
  };

  const latency = Date.now() - start;

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Edge-Latency': `${latency}ms`,
    },
  });
}
