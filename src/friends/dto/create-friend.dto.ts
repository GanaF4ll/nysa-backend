import { IsString, IsUUID } from 'class-validator';

export class CreateFriendDto {
  @IsString()
  @IsUUID()
  // sender_id est toujours user_id1
  readonly sender_id: string;
  @IsString()
  @IsUUID()
  // responder_id est toujours user_id2
  readonly responder_id: string;
}
