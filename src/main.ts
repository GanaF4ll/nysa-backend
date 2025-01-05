import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CreateUserDto } from './user/dto/create-user.dto';
import { CreateOrganisationDto } from './user/dto/create-organisation.dto';
import { RegisterUserDto } from './auth/dto/register.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Nysa API')
    .setDescription("API de l'application Nysa")
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [RegisterUserDto, CreateUserDto, CreateOrganisationDto],
  });

  SwaggerModule.setup('swagger', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
