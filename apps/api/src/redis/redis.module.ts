import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLEINT';

@Global() //storage of cart and caching
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      // ONE shared ioredis client via DI, not `new Redis()` per request —
      // ioredis manages its own connection pool internally; a fresh client
      // per request would exhaust connections under load for no benefit.
      // See troubleshooting/redis-issues.md.

      useFactory: (config: ConfigService) =>
        new Redis(config.getOrThrow('REDIS_URL')),
    },
  ],

  exports: [REDIS_CLIENT],
})
export class RedisModule {}
