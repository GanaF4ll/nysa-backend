import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Invitation_status } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';
import { CreateMemberDto } from 'src/event/member/dto/create-member.dto';

@Injectable()
export class InvitationService {
  constructor(private readonly prismaService: PrismaService) {}

  async inviteMember(
    event_id: string,
    inviter_id,
    createMemberDto: CreateMemberDto,
  ) {
    try {
      const { user_id } = createMemberDto;
      const status = Invitation_status.PENDING;

      const existingEvent = await this.prismaService.events.findUnique({
        where: { id: event_id },
      });

      if (!existingEvent) {
        throw new NotFoundException(`Event '${event_id}' not found`);
      }

      const existingInviter = await this.prismaService.users.findUnique({
        where: { id: inviter_id },
      });

      if (!existingInviter) {
        throw new NotFoundException(`User '${inviter_id}' not found`);
      }

      const newGuest = await this.prismaService.users.findUnique({
        where: { id: user_id },
      });

      if (!newGuest) {
        throw new NotFoundException(`User '${user_id}' not found`);
      }

      if (existingInviter.id === newGuest.id) {
        throw new BadRequestException('You cannot invite yourself');
      }

      const existingInvitation =
        await this.prismaService.event_Invitations.findFirst({
          where: { user_id, event_id },
        });

      if (!existingInvitation) {
        // * vérifier la visibilité de l'événement
        if (existingEvent.visibility === 'PUBLIC') {
          const newInvitation =
            await this.prismaService.event_Invitations.create({
              data: {
                user_id,
                event_id,
                status,
              },
            });

          return {
            message: `User ${user_id} has been added to the event ${existingEvent.title}`,
            data: newInvitation,
          };
        } else if (existingEvent.visibility === 'PRIVATE') {
          throw new BadRequestException('Event is private');
        } else if (existingEvent.visibility === 'FRIENDSONLY') {
          const isCreator = existingEvent.creator_id === inviter_id;
          // TODO: Check if user is friend with creator
          if (!isCreator) {
            throw new BadRequestException(
              'YOU ARE NOT THE CREATOR OF THE EVENT',
            );
          }
          const newInvitation =
            await this.prismaService.event_Invitations.create({
              data: {
                user_id,
                event_id,
                status,
              },
            });

          return {
            message: `User ${user_id} has been added to the event ${existingEvent.title}`,
            data: newInvitation,
          };
        }

        // TODO: Notification to user
      } else if (existingInvitation.status === Invitation_status.PENDING) {
        return {
          message: `User ${user_id} has already been invited to the event ${existingEvent.title}`,
        };
      }
    } catch (error) {
      return { message: error.message };
    }
  }

  async updateInvitationStatus() {}
}
