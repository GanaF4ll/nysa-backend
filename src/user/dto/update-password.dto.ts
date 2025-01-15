import { ApiProperty } from '@nestjs/swagger';
import { IsString, Validate } from 'class-validator';
import { IsStrongPassword } from 'src/user/password.validator';

export class UpdatePasswordDto {
  @IsString()
  @Validate(IsStrongPassword)
  @ApiProperty({
    type: String,
    description: "Ancien mot de passe de l'utilisateur",
    example: 'password',
    required: true,
  })
  oldPassword: string;

  @IsString()
  @Validate(IsStrongPassword)
  @ApiProperty({
    type: String,
    description: "Nouveau mot de passe de l'utilisateur",
    example: 'password',
    required: true,
  })
  newPassword: string;
}
