import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export const redisFactory = {
  provide: 'REDIS',
  useFactory: (config: ConfigService) => {
    const host = config.get('REDIS_HOST', 'redis');
    const port = Number(config.get('REDIS_PORT', 6379));
    const password = config.get('REDIS_PASSWORD');
    const opts: any = { host, port };
    if (password) opts.password = password;
    return new Redis(opts);
  },
  inject: [ConfigService],
};
