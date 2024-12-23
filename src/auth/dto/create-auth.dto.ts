import { Auth_type } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  Validate,
} from 'class-validator';
import { IsStrongPassword } from 'src/password.validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {
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

  @IsEnum(Auth_type, { message: 'type must be either USER or ORGANISATION' })
  @IsOptional()
  @ApiProperty({
    enum: Auth_type,
    description: "Le type de l'utilisateur",
    example: ['USER', 'ORGANISATION'],
  })
  readonly type: Auth_type;
}

export class LoginDto {
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
}
