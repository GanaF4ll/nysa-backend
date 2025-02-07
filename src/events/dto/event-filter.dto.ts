import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  IsString,
  IsDate,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum visibility_filter {
  ALL = 'ALL',
  DEFAULT = 'DEFAULT',
  FRIENDSONLY = 'FRIENDSONLY',
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

export enum event_scope {
  PAST = 'PAST',
  UPCOMING = 'UPCOMING',
  ALL = 'ALL',
}

export class EventFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({
    type: Number,
    description: "Limite d'events à retourner",
    example: 10,
    required: false,
  })
  limit?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Curseur pour la pagination',
    example: 'fcacfaca3c2a323bhf',
    required: false,
  })
  cursor?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Champ de recherche sur la description & le titre',
    example: 'soirée',
    required: false,
  })
  search?: string;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @ApiProperty({
    type: Date,
    description: 'Date de début minimale',
    example: '2022-01-01T00:00:00.000Z',
    required: false,
  })
  minStart?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @ApiProperty({
    type: Date,
    description: 'Date de début maximale',
    example: '2022-01-01T00:00:00.000Z',
    required: false,
  })
  maxStart?: Date;

  @IsOptional()
  @IsEnum(visibility_filter)
  @ApiProperty({
    enum: visibility_filter,
    description: 'DEFAULT = PUBLIC + FRIENDSONLY, ALL = Tous les events',
    example: 'DEFAULT',
    required: false,
  })
  visibility?: visibility_filter;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: "Frais d'inscription maximum",
    example: '20',
    required: false,
  })
  maxEntryFee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: "Frais d'inscription minimum",
    example: '20',
    required: false,
  })
  minEntryFee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: "Latitude de l'utilisateur",
    example: '48.8588443',
    required: false,
  })
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: "Longitude de l'utilisateur",
    example: '2.2943506',
    required: false,
  })
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiProperty({
    type: Number,
    description: "Distance maximale de recherche de l'event (en km)",
    example: '10',
    required: false,
  })
  maxDistance?: number;

  @IsOptional()
  @IsEnum(event_scope)
  @ApiProperty({
    enum: event_scope,
    description: `filtre les events en fonction de s'ils sont passés ou à venir, sert pour filtrer mes évènements`,
    example: 'UPCOMING',
    required: false,
  })
  scope?: event_scope;
}
