import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CreateUserDto } from './users/dto/create-user.dto';
import { CreateOrganisationDto } from './users/dto/create-organisation.dto';
import { RegisterUserDto } from './auth/dto/register.dto';
import { AuthGuard } from './auth/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Nysa API')
    .setDescription("API de l'application Nysa")
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [RegisterUserDto, CreateUserDto, CreateOrganisationDto],
  });

  SwaggerModule.setup('swagger', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const jwtService = app.get(JwtService);
  const reflector = app.get(Reflector);
  const configService = app.get(ConfigService);
  app.useGlobalGuards(new AuthGuard(jwtService, reflector, configService));

  await app.listen(3000);
}
bootstrap();
