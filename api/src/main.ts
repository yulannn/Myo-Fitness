import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser.default());

  const config = new DocumentBuilder()
    .setTitle('API Myo-Fitness')
    .setDescription('Documentation de l’API de Myo-Fitness')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  app.enableCors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalFilters(new HttpExceptionFilter());


  await app.listen(process.env.PORT ?? 3000);
  console.log(
    '\x1b[36m%s\x1b[0m',
    '===============================================================',
  );
  console.log(
    '\x1b[32m🚀  Application running on:\x1b[0m',
    `http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    '\x1b[34m📘  Swagger docs:\x1b[0m',
    `http://localhost:${process.env.PORT ?? 3000}/api`,
  );
  console.log(
    '\x1b[36m%s\x1b[0m',
    '===============================================================',
  );
}
bootstrap();
