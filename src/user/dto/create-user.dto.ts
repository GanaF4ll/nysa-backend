import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsUrl,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { SexEnum } from 'src/constants';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly auth_id: string;

  @IsString()
  @IsNotEmpty()
  readonly firstname: string;

  @IsString()
  @IsNotEmpty()
  readonly lastname: string;

  @IsString()
  @IsNotEmpty()
  readonly birthdate: string;

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
