import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
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
  @ApiProperty({
    type: String,
    description: 'ID des utilisateurs à ajouter à la conversation',
    example: [
      'cm517pv4k0001doxbzvfj4lx1',
      'cm517pzt80002doxbdv68mlga',
      'cm517q3ko0003doxb3d6wy682',
    ],
  })
  readonly users: string[];
}
