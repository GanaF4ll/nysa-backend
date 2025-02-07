import { PartialType } from '@nestjs/mapped-types';
import { CreateConversationDto } from './create-conversation.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConversationDto extends PartialType(CreateConversationDto) {
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    description: 'Nom de la conversation',
    example: 'Nom de la conversation',
  })
  readonly name?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'ID des utilisateurs à ajouter à la conversation',
    example: [
      'cm517pv4k0001doxbzvfj4lx1',
      'cm517pzt80002doxbdv68mlga',
      'cm517q3ko0003doxb3d6wy682',
    ],
    required: false,
  })
  readonly users?: string[];
}
