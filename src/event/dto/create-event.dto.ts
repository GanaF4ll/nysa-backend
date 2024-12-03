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

export class CreateEventDto {
  @IsString()
  readonly creator_id: string;

  @IsString()
  readonly title: string;

  @IsDateString()
  readonly date: string;

  @IsString()
  readonly address: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  readonly latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  readonly longitude: number;

  @IsNumber()
  @Min(1)
  readonly max_participants: number;

  @IsEnum(Event_visibility)
  readonly visibility: Event_visibility;

  @IsNumber()
  @Min(0)
  readonly entry_fee: number;

  @IsString()
  readonly description: string;

  @IsNumber()
  @Min(0)
  readonly view_count: number;
}
