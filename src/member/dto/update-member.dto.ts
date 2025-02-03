import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberDto } from './create-member.dto';
import { Member_status } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'ID dans la table auth',
    example: 'cm48rr8fv0000ublpox84yv1y',
    required: false,
  })
  readonly user_id?: string;
  @IsEnum(Member_status)
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "Statut du membre dans l'événement",
    example: 'PENDING | ACCEPTED | REFUSED | LEFT | KICKED',
    required: false,
  })
  readonly status?: Member_status;
}
