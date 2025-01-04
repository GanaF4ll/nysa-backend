import { IsEmail, MinLength, Validate } from 'class-validator';
import { IsStrongPassword } from 'src/password.validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail()
  @ApiProperty({
    type: String,
    description: "L'email de l'utilisateur",
    example: 'test@gmail.com',
  })
  readonly email: string;

  @Validate(IsStrongPassword)
  @MinLength(8)
  @ApiProperty({
    type: String,
    description: "Le mot de passe de l'utilisateur",
    example: 'Test!1234',
  })
  readonly password: string;
}
