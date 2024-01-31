import { Redis } from 'ioredis';

require('dotenv').config();

function redisClient() {
  if (process.env.REDIS_URL) {
    console.log('REDIS_URL is defined');

    return process.env.REDIS_URL;
  }

  throw new Error('REDIS_URL is not defined');
}

export const redis = new Redis(redisClient());
