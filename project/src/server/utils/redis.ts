import Redis from 'ioredis';
import { logController } from '../controllers/LogController';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

export const redis = new Redis(redisConfig);

redis.on('connect', () => {
  logController.addLog('info', 'Redis bağlantısı başarılı');
});

redis.on('error', (error) => {
  logController.addLog('error', `Redis bağlantı hatası: ${error.message}`);
});