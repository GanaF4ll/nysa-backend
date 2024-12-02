import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsUrl,
  IsOptional,
} from 'class-validator';

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
