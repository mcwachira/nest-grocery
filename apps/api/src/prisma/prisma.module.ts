import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() means every feature module (AuthModule, ProductsModule, ...)
// can inject PrismaService without each one importing PrismaModule
// individually — every feature needs DB access, so this is one of the
// few places @Global() is the right call.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
