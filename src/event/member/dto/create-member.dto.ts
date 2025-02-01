import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMemberDto {
  @IsString()
  @ApiProperty({
    type: String,
    description: 'ID dans la table user',
    example: 'cm48rr8fv0000ublpox84yv1y',
  })
  readonly user_id: string;
}
