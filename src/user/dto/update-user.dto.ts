import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsUrl,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Sex } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'ID dans la table auth',
    example: 'cm48rr8fv0000ublpox84yv1y',
  })
  auth_id?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "Prénom de l'utilisateur",
    example: 'John',
  })
  firstname?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "Nom de l'utilisateur",
    example: 'Doe',
  })
  lastname?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "Date de naissance de l'utilisateur",
    example: '01/01/2000',
  })
  birthdate?: string;

  @IsEnum(Sex, { message: 'Unknown Sex' })
  @IsOptional()
  @ApiProperty({
    enum: Sex,
    description: "Sexe de l'utilisateur",
    example: ['MALE', 'FEMALE', 'OTHER'],
  })
  sex?: Sex;

  @IsPhoneNumber('FR')
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "Numéro de téléphone de l'utilisateur",
    example: '+33612345678',
  })
  phone?: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "URL de l'image de profil",
    example: 'https://www.example.com/image.jpg',
  })
  image_url?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "Biographie de l'utilisateur",
    example: 'Je suis un bousilleur',
  })
  bio?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "Ville de l'utilisateur",
    example: 'Paris',
  })
  city?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    type: Boolean,
    description: "Statut de l'utilisateur",
    example: true,
  })
  active?: boolean;
}
