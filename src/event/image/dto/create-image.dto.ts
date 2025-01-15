import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateImageDto {
  @IsString()
  @ApiProperty({
    type: String,
    description: "nom de l'image",
    example: '10121551_image.jpg',
  })
  readonly name: string;
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: "Ordre d'affichage de l'image",
    example: 1,
  })
  order: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: "Fichier de l'image",
  })
  file: Buffer;
}
