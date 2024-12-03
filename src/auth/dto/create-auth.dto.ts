import { Auth_type } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  Validate,
} from 'class-validator';
import { IsStrongPassword } from 'src/password.validator';
export class CreateAuthDto {
  @IsEmail()
  readonly email: string;

  @Validate(IsStrongPassword)
  @MinLength(8)
  readonly password: string;

  @IsEnum(Auth_type, { message: 'type must be either USER or ORGANISATION' })
  @IsOptional()
  readonly type: Auth_type;
}

export class LoginDto {
  @IsEmail()
  readonly email: string;

  @Validate(IsStrongPassword)
  @MinLength(8)
  readonly password: string;
}
