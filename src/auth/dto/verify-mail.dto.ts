import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class VerifyMailDto {
  @IsEmail()
  @ApiProperty({
    type: String,
    description: "L'email de l'utilisateur",
    example: 'test@gmail.com',
  })
  readonly email: string;
}
