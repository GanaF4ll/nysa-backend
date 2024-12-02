import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsUrl,
  IsOptional,
} from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  readonly auth_id?: string;

  @IsString()
  @IsOptional()
  readonly firstname?: string;

  @IsString()
  @IsOptional()
  readonly lastname?: string;

  @IsString()
  @IsOptional()
  readonly birthdate?: string;

  @IsString()
  @IsOptional()
  readonly sex?: string;

  @IsPhoneNumber('FR')
  @IsOptional()
  readonly phone?: string;

  @IsUrl()
  @IsOptional()
  readonly image_url?: string;

  @IsString()
  @IsOptional()
  readonly bio?: string;

  @IsString()
  @IsOptional()
  readonly city?: string;
}
