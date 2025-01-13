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
  @Transform(({ value }) => new Date(value))
  @IsDate()
  minStart?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  maxStart?: Date;

  @IsOptional()
  @IsEnum(Event_visibility)
  visibility?: Event_visibility;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxEntryFee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minEntryFee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxDistance?: number;
}
