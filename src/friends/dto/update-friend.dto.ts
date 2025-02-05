import { PartialType } from '@nestjs/swagger';
import { CreateFriendDto } from './create-friend.dto';
import { IsString, IsUUID } from 'class-validator';

export class UpdateFriendDto extends PartialType(CreateFriendDto) {
  @IsString()
  @IsUUID()
  readonly user_id1: string;

  @IsString()
  @IsUUID()
  readonly user_id2: string;

  @IsString()
  readonly status: 'ACCEPTED' | 'REFUSED';
}
