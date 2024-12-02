import {
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  Validate,
} from 'class-validator';
import { AuthType } from 'src/constants';
import { IsStrongPassword } from 'src/password.validator';
export class CreateAuthDto {
  @IsEmail()
  readonly email: string;

  @Validate(IsStrongPassword)
  @MinLength(8)
  readonly password: string;

  @IsEnum(AuthType, { message: 'type must be either USER or ORGANISATION' })
  @IsOptional()
  readonly type: AuthType;
}

export class LoginDto {
  @IsEmail()
  readonly email: string;

  @Validate(IsStrongPassword)
  @MinLength(8)
  readonly password: string;
}
