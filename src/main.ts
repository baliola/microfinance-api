import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config as loadEnv } from 'dotenv';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { TimeInterceptor } from './interceptors/time/time.interceptor';
import helmet, { HelmetOptions } from 'helmet';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './interceptors/response/response.interceptor';

loadEnv();
async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);

  // CORS Option.
  logger.log('Enabling CORS Options...');
  const allowedOrigins = process.env.CORS_URL
    ? process.env.CORS_URL.split(',').map((url) => url.trim()) // Ensure it's an array
    : [];
  const corsOptions: CorsOptions = {
    credentials: true,
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);
      if (!allowedOrigins.includes(origin)) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin, origin: ${origin}`;
        return cb(new Error(msg), false);
      }

      return cb(null, true);
    },
  };
  app.enableCors(corsOptions);

  // Helmet Option.
  logger.log('Enabling HELMET Options...');
  const helmetOptions: HelmetOptions = {
    referrerPolicy: { policy: 'no-referrer' },
    contentSecurityPolicy: { useDefaults: true },
    hsts: { preload: true, maxAge: 360000 },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: true,
    noSniff: false,
    frameguard: false,
    originAgentCluster: true,
    ieNoOpen: true,
    hidePoweredBy: true,
    xssFilter: true,
  };
  app.use(helmet(helmetOptions));

  // Cookie Parser Option.
  logger.log('Enabling Cookie Parser...');
  app.use(cookieParser());

  // Global Pipes.
  logger.log('Enabling Global Pipes Options...');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Interceptors.
  logger.log('Enabling Global Interceptors...');
  app.useGlobalInterceptors(new TimeInterceptor());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger Docs.
  logger.log('Enbaling Swagger Docs...');
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Microfinance API')
    .setDescription(
      'Documentation of API that interact on Microfinance based on DJoin Case',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('docs', app, doc);
  Logger.log(
    `Swagger Docs can be access on ${process.env.WEB_URL}://${process.env.HOST}:${process.env.PORT}/docs`,
  );

  // Server Instance.
  const port = process.env.PORT;
  await app.listen(port);
  logger.log(`Application running on: ${await app.getUrl()}`);
}

bootstrap();
