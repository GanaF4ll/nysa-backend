import { PartialType } from '@nestjs/swagger';
import { CreateFriendDto } from './create-friend.dto';
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { Invitation_status } from '@prisma/client';

export class UpdateFriendDto extends PartialType(CreateFriendDto) {
  @IsString()
  @IsUUID()
  readonly user_id1: string;

  @IsString()
  @IsUUID()
  readonly user_id2: string;

  @IsEnum(Invitation_status)
  readonly status: Invitation_status;
}
