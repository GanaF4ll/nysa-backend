import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Auth_type } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {
  @IsEmail()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "L'email de l'utilisateur",
    example: 'test@gmail.com',
  })
  readonly email: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "Le mot de passe de l'utilisateur",
    example: 'Test!1234',
  })
  password: string;

  @IsEnum(Auth_type, { message: 'type must be either USER or ORGANISATION' })
  @IsOptional()
  @ApiProperty({
    enum: Auth_type,
    description: "Le type de l'utilisateur",
    example: ['USER', 'ORGANISATION'],
  })
  type: Auth_type;
}
