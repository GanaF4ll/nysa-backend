import { CreateImageDto } from './../../event/image/dto/create-image.dto';
import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsUrl,
  IsOptional,
  IsEnum,
  IsEmail,
  Validate,
  MinLength,
  IsAlpha,
  IsDateString,
} from 'class-validator';
import { IsStrongPassword } from 'src/user/password.validator';
import { Sex } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({
    type: String,
    description: "L'email de l'utilisateur",
    example: 'test@gmail.com',
  })
  readonly email: string;

  @Validate(IsStrongPassword)
  @MinLength(8)
  @ApiProperty({
    type: String,
    description: "Le mot de passe de l'utilisateur",
    example: 'Test!1234',
  })
  readonly password: string;

  @IsAlpha('fr-FR')
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: "Prénom de l'utilisateur",
    example: 'John',
  })
  readonly firstname: string;

  @IsAlpha('fr-FR')
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: "Nom de l'utilisateur",
    example: 'Doe',
  })
  readonly lastname: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "Date de naissance de l'utilisateur",
    example: '01/01/2000',
  })
  readonly birthdate?: string;

  @IsEnum(Sex, { message: 'Unknown Sex' })
  @IsOptional()
  @ApiProperty({
    enum: Sex,
    description: "Sexe de l'utilisateur",
    example: ['MALE', 'FEMALE', 'OTHER'],
    required: false,
  })
  readonly sex?: Sex;

  @IsPhoneNumber('FR')
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "Numéro de téléphone de l'utilisateur",
    example: '+33612345678',
    required: false,
  })
  readonly phone?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "Biographie de l'utilisateur",
    example: 'Je suis un bousilleur',
    required: false,
  })
  readonly bio?: string;
}
