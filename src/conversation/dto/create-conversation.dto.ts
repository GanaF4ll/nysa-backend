import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsArray()
  readonly users: string[];
}
