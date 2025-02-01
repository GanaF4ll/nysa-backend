import { ApiProperty } from '@nestjs/swagger';
import { Invitation_status } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateInvitationDto {
  @IsOptional()
  @IsEnum(Invitation_status)
  @ApiProperty()
  readonly status: Invitation_status;

  @IsOptional()
  @IsString()
  readonly invitation_id: string;
}
