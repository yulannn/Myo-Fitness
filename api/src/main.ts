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
