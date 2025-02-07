import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Provider } from '@prisma/client';
export class CreateGoogleUserDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly firstname: string;

  @IsString()
  @IsNotEmpty()
  readonly lastname?: string;

  @IsUrl()
  @IsOptional()
  readonly image_url?: string;

  @IsEnum(Provider)
  readonly provider: Provider;
}
