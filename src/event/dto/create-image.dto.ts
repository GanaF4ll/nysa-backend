import { IsNumber, IsString } from 'class-validator';

export class CreateImageDto {
  @IsString()
  readonly url: string;
  @IsNumber()
  order: number;
}
