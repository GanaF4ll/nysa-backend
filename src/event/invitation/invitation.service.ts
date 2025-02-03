import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Invitation_status } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';
import { CreateMemberDto } from 'src/member/dto/create-member.dto';

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

      const actualParticipants =
        await this.prismaService.event_members.findMany({
          where: { event_id },
        });

      if (actualParticipants.length >= existingEvent.max_participants) {
        throw new BadRequestException('Event is full');
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
                inviter_id,
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
                inviter_id,
              },
            });

          return {
            message: `${newGuest.firstname ?? newGuest.name} has been added to the event ${existingEvent.title}`,
            data: newInvitation,
          };
        }
        // TODO: détruire l'invitation si l'évènement est supprimé ou passé
        // TODO: Notification to user
      } else if (existingInvitation.status === Invitation_status.PENDING) {
        return {
          message: `${newGuest.firstname ?? newGuest.name} has already been invited to the event ${existingEvent.title}`,
        };
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async getMyInvitations(user_id: string) {
    try {
      const existingUser = await this.prismaService.users.findUnique({
        where: { id: user_id },
      });
      if (!existingUser) {
        throw new NotFoundException(`User '${user_id}' not found`);
      }

      const invitations = await this.prismaService.event_Invitations.findMany({
        where: { user_id, status: Invitation_status.PENDING },
        select: { id: true, event_id: true, status: true, inviter_id: true },
      });

      return { data: invitations };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async acceptInvitation(user_id: string, invitation_id: string) {
    try {
      const existingUser = await this.prismaService.users.findUnique({
        where: { id: user_id },
      });
      if (!existingUser) {
        throw new NotFoundException(`User '${user_id}' not found`);
      }

      const existingInvitation =
        await this.prismaService.event_Invitations.findUnique({
          where: { id: invitation_id },
        });

      if (!existingInvitation) {
        throw new NotFoundException(`Invitation '${invitation_id}' not found`);
      }

      if (existingUser.id !== existingInvitation.user_id) {
        throw new BadRequestException(
          'You are not the owner of this invitation',
        );
      }

      const updatedInv = await this.prismaService.event_Invitations.update({
        where: { id: invitation_id },
        data: { status: Invitation_status.ACCEPTED },
      });

      if (!updatedInv) {
        throw new BadRequestException('Invitation not updated');
      }

      return updatedInv;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
}
