import { PartialType } from '@nestjs/mapped-types';
import { CreateImageDto } from './create-image.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateImageDto extends PartialType(CreateImageDto) {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "nom de l'image",
    example: '10121551_image.jpg',
  })
  readonly name?: string;
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    type: Number,
    description: "Ordre d'affichage de l'image",
    example: 1,
    required: false,
  })
  order?: number;
}
