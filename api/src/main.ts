import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import { EnvValidationService } from './config/env-validation.service';
import { Logger } from 'nestjs-pino';


async function bootstrap() {
  // Valider les variables d'environnement AVANT de créer l'app
  const envValidator = new EnvValidationService();
  envValidator.validateEnvironment();
  envValidator.validateOptionalEnvironment();

  // Créer l'app avec le logger désactivé par défaut
  // (On va utiliser Pino à la place)
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer les logs jusqu'à ce que Pino soit prêt
  });

  // Utiliser Pino comme logger global
  app.useLogger(app.get(Logger));


  // Middleware pour préserver le raw body pour Stripe webhook
  // DOIT être avant le parsing JSON global
  app.use('/api/v1/stripe/webhook', json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }
  }));

  // Global JSON body parser for all other routes
  app.use(json());

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

  const allowedOrigins = [
    'http://localhost:5173',
    'http://10.15.4.156:5173',
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3000;
  const host = '0.0.0.0';

  await app.listen(port, host);

  console.log(
    '\x1b[36m%s\x1b[0m',
    '===============================================================',
  );
  console.log(
    '\x1b[32m🚀  Application running on:\x1b[0m',
  );
  console.log(`   - Local:   http://localhost:${port}`);
  console.log(`   - Network: http://10.15.4.156:${port}`);
  console.log(
    '\x1b[34m📘  Swagger docs:\x1b[0m',
  );
  console.log(`   - Local:   http://localhost:${port}/api`);
  console.log(`   - Network: http://10.15.4.156:${port}/api`);
  console.log(
    '\x1b[36m%s\x1b[0m',
    '===============================================================',
  );
}
bootstrap();
