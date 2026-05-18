import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // To enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Set global API prefix
  app.setGlobalPrefix('api/v1');

  // Enable CORS for all origins
  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Tokenize AI')
    .setDescription('API documentation for Tokenize AI application')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    .addTag('User', 'User management endpoints')
    .addTag('Patent', 'Patent management endpoints')
    .addTag('User Profile', 'User profile management endpoints')
    .addTag('User Referrals', 'User referrals management endpoints')
    .addTag('Authentication', 'Authentication endpoints')
    .addTag('User Wallet', 'User wallet management endpoints')

    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const serverPort = configService.get<number>('SERVER_PORT') ?? 4000;
  await app.listen(serverPort);
}
bootstrap();
