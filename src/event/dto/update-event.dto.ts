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
import { Event_visibility } from 'src/constants';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsOptional()
  @IsString()
  readonly title?: string;

  @IsOptional()
  @IsDateString()
  readonly date?: string;

  @IsOptional()
  @IsString()
  readonly address?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  readonly latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  readonly longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  readonly max_participants?: number;

  @IsOptional()
  @IsEnum(Event_visibility)
  readonly visibility?: Event_visibility;

  @IsOptional()
  @IsNumber()
  readonly entry_fee?: number;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsNumber()
  readonly view_count?: number;
}
