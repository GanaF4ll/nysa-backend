import {
  IsEnum,
  IsNumber,
  IsString,
  IsDateString,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { Event_visibility } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @IsString()
  @ApiProperty({
    type: String,
    description: "titre de l'événement",
    example: 'Soirée Bousilleurs',
  })
  readonly title: string;

  @IsDateString()
  @ApiProperty({
    type: String,
    description:
      "Date de l'évènement, sous format string, conversion en format date faite dans le service",
    example: '01/01/2025',
  })
  readonly date: string;

  @IsString()
  @ApiProperty({
    type: String,
    description: "adresse de l'évènement",
    example: '24 rue des bousilleurs, 75000 Paris',
  })
  readonly address: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  @ApiProperty({
    type: Number,
    description:
      "latitude pour géolocalisation de l'évènement, MIN: -90, MAX: 90",
    example: '48.8566',
  })
  readonly latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @ApiProperty({
    type: Number,
    description:
      "longitude pour géolocalisation de l'évènement, MIN: -180, MAX: 180",
    example: '2.3522',
  })
  readonly longitude: number;

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
}
