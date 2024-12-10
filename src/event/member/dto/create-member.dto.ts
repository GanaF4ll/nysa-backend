import { Member_status } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  readonly user_id: string;
  @IsEnum(Member_status)
  readonly status: Member_status;
}
