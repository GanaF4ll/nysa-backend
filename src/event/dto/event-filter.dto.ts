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
import { Event_visibility } from '@prisma/client';

export class EventFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  dateFrom?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  dateTo?: Date;

  @IsOptional()
  @IsEnum(Event_visibility)
  visibility?: Event_visibility;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxEntryFee?: number;

  @IsOptional()
  @IsString()
  address?: string;
}
