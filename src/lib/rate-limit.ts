import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

export function getRateLimiter(plan: string) {
  const limit = plan === 'PRO' ? 200 : plan === 'ENTERPRISE' ? 1000 : 20;

  if (!redis) {
    return {
      limit: async () => ({ success: true, limit, remaining: limit, reset: 0 }),
    } as any;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, '1 h'),
    analytics: false,
  });
}
