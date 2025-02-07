import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateFriendDto {
  @IsString()
  @IsUUID()
  @ApiProperty({
    type: String,
    description: 'ID du demandeur dans la table users',
    example: 'cm48rr8fv0000ublpox84yv1y',
  })
  // sender_id est toujours user_id1
  readonly sender_id: string;
  @IsString()
  @IsUUID()
  @ApiProperty({
    type: String,
    description: 'ID du receveur dans la table users',
    example: 'cm48rr8fv0000ublpox84yv1y',
  })
  // responder_id est toujours user_id2
  readonly responder_id: string;
}
