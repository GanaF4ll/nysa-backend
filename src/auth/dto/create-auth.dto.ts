import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { AuthType } from 'src/constants';
export class CreateAuthDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(8)
  readonly password: string;

  @IsEnum(AuthType, { message: 'type must be either USER or ORGANISATION' })
  @IsOptional()
  readonly type: AuthType;
}

export class LoginDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(8)
  readonly password: string;
}
