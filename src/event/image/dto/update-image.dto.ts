import { PartialType } from '@nestjs/mapped-types';
import { CreateImageDto } from '../image/dto/create-image.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateImageDto extends PartialType(CreateImageDto) {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "URL de l'image",
    example: 'https://www.example.com/image.jpg',
  })
  readonly url?: string;
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    type: Number,
    description: "Ordre d'affichage de l'image",
    example: 1,
  })
  order?: number;
}
