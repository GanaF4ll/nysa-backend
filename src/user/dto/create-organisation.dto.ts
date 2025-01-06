import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsUrl,
  IsOptional,
  IsEmail,
  Validate,
  MinLength,
} from 'class-validator';
import { Sex } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from 'src/user/password.validator';

export class CreateOrganisationDto {
  @IsEmail()
  @ApiProperty({
    type: String,
    description: "L'email de l'organisation",
    example: 'test@gmail.com',
  })
  readonly email: string;

  @Validate(IsStrongPassword)
  @MinLength(8)
  @ApiProperty({
    type: String,
    description: "Le mot de passe de l'organisation",
    example: 'Test!1234',
  })
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: "nom de l'organisation",
    example: 'Nysa',
  })
  readonly name: string;

  @IsPhoneNumber('FR')
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "Numéro de téléphone de l'organisation",
    example: '+33612345678',
    required: false,
  })
  readonly phone?: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "URL de l'image de profil",
    example: 'https://www.example.com/image.jpg',
    required: false,
  })
  readonly image_url?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "Biographie de l'organisation",
    example: 'Je suis un bousilleur',
    required: false,
  })
  readonly bio?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "Ville de l'organisation",
    example: 'Paris',
    required: false,
  })
  readonly city?: string;
}
