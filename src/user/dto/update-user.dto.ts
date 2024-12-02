import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsUrl,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { SexEnum } from 'src/constants';

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

  @IsEnum(SexEnum, { message: 'Unknown Sex' })
  @IsOptional()
  readonly sex?: SexEnum;

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
