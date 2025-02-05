import { IsString, IsUUID } from 'class-validator';

export class CreateFriendDto {
  @IsString()
  @IsUUID()
  readonly user_id1: string;
  @IsString()
  @IsUUID()
  readonly user_id2: string;
}
