import { IsEmail } from 'class-validator';

export class VerifyMailDto {
  @IsEmail()
  readonly email: string;
}
