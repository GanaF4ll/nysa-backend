import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { AuthType } from 'src/constants';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {
  @IsEmail()
  @IsOptional()
  readonly email: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password: string;

  @IsEnum(AuthType, { message: 'type must be either USER or ORGANISATION' })
  @IsOptional()
  type: AuthType;
}
