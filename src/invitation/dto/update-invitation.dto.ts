import { ApiProperty } from '@nestjs/swagger';
import { Invitation_status } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateInvitationDto {
  @IsOptional()
  @IsEnum(Invitation_status)
  @ApiProperty({
    enum: Invitation_status,
    description: "Statut de l'invitation, par défaut 'PENDING'",
    example: ['PENDING', 'ACCEPTED', 'REFUSED'],
    required: true,
  })
  readonly status: Invitation_status;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'ID dans la table Event_Invitations',
    example: 'cm48rr8fv0000ublpox84yv1y',
  })
  readonly invitation_id: string;
}
