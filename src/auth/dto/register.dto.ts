import { Sex, User_type } from '@prisma/client';
import {
  IsEnum,
  IsString,
  IsOptional,
  ValidateIf,
  IsDateString,
  IsEmail,
  MinLength,
  IsPhoneNumber,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from 'src/users/password.validator';

export class RegisterUserDto {
  @IsEnum(User_type)
  @ApiProperty({
    description: "Type d'utilisateur (USER ou ORGANISATION)",
    example: User_type.USER,
  })
  readonly type: User_type;

  // Propriétés communes
  @IsString()
  @IsEmail()
  @ApiProperty({ description: 'Email', example: 'test@mail.com' })
  readonly email: string;

  @Validate(IsStrongPassword)
  @IsString()
  @MinLength(8)
  @ApiProperty({ description: 'Mot de passe', example: 'Test!1234' })
  readonly password: string;

  @IsString()
  @ApiProperty({
    description: 'Nom (utilisateur ou organisation)',
    example: 'Doe',
  })
  readonly firstname?: string;

  @IsString()
  @ApiProperty({
    description: 'Nom (utilisateur ou organisation)',
    example: 'Doe',
  })
  readonly lastname?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: "Nom de l'organisation (obligatoire si ORGANISATION)",
    example: 'Nysa',
  })
  readonly name?: string;

  @IsOptional()
  @IsPhoneNumber('FR')
  @ApiProperty({ description: 'Numéro de téléphone', example: '+33612345678' })
  readonly phone?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Bio',
    example: 'Je suis un utilisateur ou une organisation.',
  })
  readonly bio?: string;

  // Champs spécifiques à USER
  @ValidateIf((dto) => dto.type === User_type.USER)
  @IsDateString()
  @ApiProperty({
    description: 'Date de naissance (USER)',
    example: '1990-01-01',
  })
  readonly birthdate?: string;

  @ValidateIf((dto) => dto.type === User_type.USER)
  @IsEnum(Sex, { message: 'Unknown Sex' })
  @IsOptional()
  @ApiProperty({
    enum: Sex,
    description: "Sexe de l'utilisateur",
    example: ['MALE', 'FEMALE', 'OTHER'],
    required: false,
  })
  readonly sex?: Sex;

  // Champs spécifiques à ORGANISATION
  @ValidateIf((dto) => dto.type === User_type.ORGANISATION)
  @IsString()
  @ApiProperty({
    description: "Ville de l'organisation (ORGANISATION uniquement)",
    example: 'Paris',
  })
  readonly city?: string;
}
