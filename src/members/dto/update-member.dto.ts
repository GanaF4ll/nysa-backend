import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberDto } from './create-member.dto';
import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @IsString()
  @IsUUID()
  @ApiProperty({
    type: String,
    description: 'ID dans la table auth',
    example: 'cm48rr8fv0000ublpox84yv1y',
    required: false,
  })
  readonly user_id: string;

  @IsString()
  @IsUUID()
  @ApiProperty({
    type: String,
    description: 'ID dans la table events',
    example: 'cm48rr8fv0000ublpox84yv1y',
  })
  readonly event_id: string;
}
