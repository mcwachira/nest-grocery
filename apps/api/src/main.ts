import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Strips unknown properties from incoming request bodies (whitelist)
  // and REJECTS the request if an unknown property is present
  // (forbidNonWhitelisted) rather than silently dropping it — the second
  // half matters: silently dropping a typo'd field is a bug that looks
  // like it worked. transform:true lets Nest auto-convert query/param
  // strings into the types your DTOs declare (e.g. "5" -> 5).

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  //Needed to read thr httpOnl;y refresh cookie in Auth controller
  app.use(cookieParser());

  // credentials:true is required for the browser to send/receive cookies
  // cross-origin. In LOCAL dev, docker/nginx/local.conf path-routes
  // everything through one origin so this never gets exercised — in
  // PRODUCTION, docker/nginx/prod.conf routes by subdomain
  // (storefront.example.com calling api.example.com), which is genuinely
  // cross-origin. Configure this for real now so prod doesn't surprise
  // you later — see docs/01-auth.md's pitfalls section.

  app.enableCors({
    origin: [process.env.STOREFRONT_ORIGIN, process.env.ADMIN_ORIGIN].filter(
      Boolean,
    ),
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
