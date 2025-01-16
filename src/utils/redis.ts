import { Redis } from 'ioredis';
import moment from 'moment';
import { REDIS_URI } from '@/constants/env.js';

const redis = new Redis(REDIS_URI || '', {
  lazyConnect: true,
});

redis.on('connect', () => {
  console.log('Connected to Redis!');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export function getDailyUserKey(userId: string | number) {
  const date = moment().format('YYYYMMDD');
  return `uid:${userId}:${date}`;
}

export default redis;
