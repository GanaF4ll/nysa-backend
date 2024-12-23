import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateImageDto {
  @IsString()
  @ApiProperty({
    type: String,
    description: "URL de l'image",
    example: 'https://www.example.com/image.jpg',
  })
  readonly url: string;
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: "Ordre d'affichage de l'image",
    example: 1,
  })
  order: number;
}
