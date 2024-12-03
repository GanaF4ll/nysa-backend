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
export class UpdateAuthDto extends PartialType(CreateAuthDto) {
  @IsEmail()
  @IsOptional()
  readonly email: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password: string;

  @IsEnum(Auth_type, { message: 'type must be either USER or ORGANISATION' })
  @IsOptional()
  type: Auth_type;
}
