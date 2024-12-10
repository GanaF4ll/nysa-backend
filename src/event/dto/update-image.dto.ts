import { PartialType } from '@nestjs/mapped-types';
import { CreateImageDto } from './create-image.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateImageDto extends PartialType(CreateImageDto) {
  @IsString()
  @IsOptional()
  readonly url?: string;
  @IsNumber()
  @IsOptional()
  order?: number;
}
