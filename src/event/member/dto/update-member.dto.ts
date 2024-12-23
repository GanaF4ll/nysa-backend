import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberDto } from './create-member.dto';
import { Member_status } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @IsString()
  @IsOptional()
  readonly user_id?: string;
  @IsEnum(Member_status)
  @IsOptional()
  readonly status?: Member_status;
}
