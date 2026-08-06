// Persistent sliding-window rate limiter for serverless environment using Upstash Redis REST API
// Fallback to best-effort in-memory cache if Upstash credentials are not provided.

const inMemoryStore = new Map();

export async function checkRateLimit(ip, limit = 10, windowSeconds = 900) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  const key = `rate_limit:${ip}`;

  if (url && token) {
    try {
      console.log(`[RateLimiter] Active Backend: Upstash Redis REST (IP: ${ip})`);
      // Use Upstash REST pipeline: INCR key and EXPIRE key if first request
      const response = await fetch(`${url}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', key],
          ['EXPIRE', key, windowSeconds, 'NX'],
        ]),
      });

      const data = await response.json();
      const currentRequests = data[0]?.result || 1;

      if (currentRequests > limit) {
        return { allowed: false, current: currentRequests, limit };
      }
      return { allowed: true, current: currentRequests, limit };
    } catch (err) {
      console.error('[RateLimiter] Upstash Redis check failed, falling back to allow:', err.message);
      return { allowed: true, current: 1, limit };
    }
  }

  console.log(`[RateLimiter] Active Backend: In-Memory Fallback (IP: ${ip})`);
  // Local/Development Fallback: In-memory window tracking per warm instance
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = inMemoryStore.get(key) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  record.count += 1;
  inMemoryStore.set(key, record);

  if (record.count > limit) {
    return { allowed: false, current: record.count, limit };
  }

  return { allowed: true, current: record.count, limit };
}
