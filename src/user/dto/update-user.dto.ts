import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsUrl,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { SexEnum } from 'src/constants';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  auth_id?: string;

  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  lastname?: string;

  @IsString()
  @IsOptional()
  birthdate?: string;

  @IsEnum(SexEnum, { message: 'Unknown Sex' })
  @IsOptional()
  sex?: SexEnum;

  @IsPhoneNumber('FR')
  @IsOptional()
  phone?: string;

  @IsUrl()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
