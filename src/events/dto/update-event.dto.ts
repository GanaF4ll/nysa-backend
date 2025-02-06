import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Event_visibility } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: "titre de l'événement",
    example: 'Soirée Bousilleurs',
    required: false,
  })
  readonly title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: "adresse de l'évènement",
    example: '24 rue des bousilleurs, 75000 Paris',
    required: false,
  })
  readonly address?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @ApiProperty({
    type: Number,
    description:
      "latitude pour géolocalisation de l'évènement, MIN: -90, MAX: 90",
    example: '48.8566',
    required: false,
  })
  readonly latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @ApiProperty({
    type: Number,
    description:
      "longitude pour géolocalisation de l'évènement, MIN: -180, MAX: 180",
    example: '2.3522',
    required: false,
  })
  readonly longitude?: number;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    type: String,
    description: "Date de début de l'évènement",
    example: '01/01/2000',
  })
  readonly start_time?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    type: String,
    description: "Date de début de l'évènement",
    example: '01/01/2000',
  })
  readonly end_time?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiProperty({
    type: Number,
    description:
      "nombre de participants maximum dans l'évènement, MIN: 1, MAX: ?",
    example: '10',
    required: false,
  })
  readonly max_participants?: number;

  @IsOptional()
  @IsEnum(Event_visibility)
  @ApiProperty({
    enum: Event_visibility,
    description: "visibilité de l'évènement",
    example: ['PUBLIC', 'PRIVATE', 'FRIENDSONLY'],
    required: false,
  })
  readonly visibility?: Event_visibility;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: "prix d'entrée de l'évènement, MIN: 0",
    example: '10',
    required: false,
  })
  readonly entry_fee?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: "description de l'évènement",
    example: 'Venez nombreux à la soirée Bousilleurs !',
    required: false,
  })
  readonly description?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: "nombre de vues de l'évènement",
    example: '0',
    required: false,
  })
  readonly view_count?: number;
}
