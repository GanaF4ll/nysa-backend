import { PartialType } from '@nestjs/swagger';
import { CreateFriendDto } from './create-friend.dto';
import { IsString, IsUUID } from 'class-validator';

export class UpdateFriendDto extends PartialType(CreateFriendDto) {
  @IsString()
  @IsUUID()
  // sender_id est toujours user_id1
  readonly sender_id: string;

  @IsString()
  @IsUUID()
  // responder_id est toujours user_id2
  readonly responder_id: string;

  @IsString()
  readonly status: 'ACCEPTED' | 'REFUSED';
}
