import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Prisma 7 requires a driver adapter for a direct database connection —
// schema.prisma's datasource block can no longer declare `url`. The
// adapter is what actually supplies the connection string at runtime.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Extending PrismaClient (rather than wrapping it as a property) means
// every model method (this.user.findUnique, this.product.create, ...)
// is available directly on the injected service — no extra indirection.
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({ adapter });
  }

  async onModuleInit() {
    // Connect explicitly at app startup instead of lazily on first query —
    // this way a bad DATABASE_URL fails fast at boot, not on the first
    // request a real user makes.
    await this.$connect();
  }

  async onModuleDestroy() {
    // Release the connection cleanly on shutdown (relevant for graceful
    // container restarts in docker-production.yml).
    await this.$disconnect();
  }
}
