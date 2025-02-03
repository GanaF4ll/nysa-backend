import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMemberDto {
  @IsString()
  @ApiProperty({
    type: String,
    description: 'ID dans la table users',
    example: 'cm48rr8fv0000ublpox84yv1y',
  })
  readonly member_id: string;

  @IsString()
  @ApiProperty({
    type: String,
    description: 'ID dans la table events',
    example: 'cm48rr8fv0000ublpox84yv1y',
  })
  readonly event_id: string;
}
