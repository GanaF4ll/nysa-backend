import { IsEmail, IsOptional, MinLength, Validate } from 'class-validator';
import { IsStrongPassword } from 'src/users/password.validator';
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

  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Identifiant du device, uniquement pour les téléphones',
    example: '123456',
  })
  readonly device_id?: string;
}
