import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class VerifyTokenDto {
  @ApiProperty({
    description: "ID de l'utilisateur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: "Email de l'utilisateur",
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}
