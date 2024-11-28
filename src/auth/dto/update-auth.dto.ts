import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {
  @IsEmail()
  @IsOptional()
  readonly email: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  readonly password: string;

  @IsString()
  @IsOptional()
  readonly type: string;
}
