import {
  IsEnum,
  IsNumber,
  IsString,
  IsDateString,
  Min,
  IsOptional,
  IsNotEmpty,
  IsArray,
} from 'class-validator';
import { Event_visibility } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { CreateImageDto } from '../image/dto/create-image.dto';

export class CreateEventDto {
  @IsString()
  @ApiProperty({
    type: String,
    description: "titre de l'événement",
    example: 'Soirée Bousilleurs',
  })
  readonly title: string;

  @IsString()
  @ApiProperty({
    type: String,
    description: "adresse de l'évènement",
    example: '24 rue des bousilleurs, 75000 Paris',
  })
  readonly address: string;

  @IsNumber()
  @ApiProperty({
    type: Number,
    description:
      "latitude pour géolocalisation de l'évènement, MIN: -90, MAX: 90",
    example: '48.8566',
  })
  readonly latitude: number;

  @IsNumber()
  @ApiProperty({
    type: Number,
    description:
      "longitude pour géolocalisation de l'évènement, MIN: -180, MAX: 180",
    example: '2.3522',
  })
  readonly longitude: number;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: "Date de début de l'évènement",
    example: '01/01/2000',
  })
  readonly start_time: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: "Date de début de l'évènement",
    example: '01/01/2000',
  })
  readonly end_time: string;

  @IsNumber()
  @Min(1)
  @ApiProperty({
    type: Number,
    description:
      "nombre de participants maximum dans l'évènement, MIN: 1, MAX: ?",
    example: '10',
  })
  readonly max_participants: number;

  @IsEnum(Event_visibility)
  @ApiProperty({
    enum: Event_visibility,
    description: "visibilité de l'évènement",
    example: ['PUBLIC', 'PRIVATE', 'FRIENDSONLY'],
  })
  readonly visibility: Event_visibility;

  @IsNumber()
  @Min(0)
  @ApiProperty({
    type: Number,
    description: "prix d'entrée de l'évènement, MIN: 0",
    example: '10',
  })
  readonly entry_fee: number;

  @IsString()
  @ApiProperty({
    type: String,
    description: "description de l'évènement",
    example: 'Venez nombreux à la soirée Bousilleurs !',
  })
  readonly description: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty({
    type: Number,
    description: "nombre de vues de l'évènement",
    example: '0',
  })
  readonly view_count?: number;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    type: [CreateImageDto],
    description: "images de l'évènement",
  })
  event_images?: CreateImageDto[];
}
