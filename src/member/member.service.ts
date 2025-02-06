import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { Member_status } from '@prisma/client';
import { CreateMemberDto } from './dto/create-member.dto';

@Injectable()
export class MemberService {
  constructor(private prismaService: PrismaService) {}

  async addMember(createMemberDto: CreateMemberDto) {
    const { event_id, member_id } = createMemberDto;
    try {
      const status = Member_status.CONFIRMED;

      const existingEvent = await this.prismaService.events.findUnique({
        where: { id: event_id },
      });

      if (!existingEvent) {
        throw new NotFoundException(`Event '${event_id}' not found`);
      }

      const newGuest = await this.prismaService.users.findUnique({
        where: { id: member_id },
      });

      if (!newGuest) {
        throw new NotFoundException(`User '${member_id}' not found`);
      }

      const existingMember = await this.prismaService.event_members.findFirst({
        where: { user_id: member_id, event_id },
      });

      if (!existingMember || existingMember.status === Member_status.LEFT) {
        // * vérifier la visibilité de l'événement

        const newMember = await this.prismaService.event_members.create({
          data: {
            user_id: member_id,
            event_id,
            status,
          },
        });

        return {
          message: `User has been added to the event`,
          data: newMember,
        };

        // TODO: Notification to user
      } else if (existingMember.status === Member_status.CONFIRMED) {
        throw new ConflictException(`User is already a member of the event`);
      } else if (existingMember.status === Member_status.KICKED) {
        throw new ConflictException(`User has been kicked from the event`);
      }
      // ? si quelqu'un s'est fait BAN peut-on le réinviter ?
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async getMembers(event_id: string) {
    try {
      const existingEvent = await this.prismaService.events.findUnique({
        where: { id: event_id },
      });

      if (!existingEvent) {
        throw new NotFoundException(`Event '${event_id}' not found`);
      }

      const members = await this.prismaService.event_members.findMany({
        where: { event_id, status: Member_status.CONFIRMED },
      });

      const memberCount = members.length;

      return { members, memberCount };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async leaveEvent(memberDto: CreateMemberDto) {
    const { member_id, event_id } = memberDto;
    try {
      const existingUser = await this.prismaService.users.findUnique({
        where: { id: member_id },
      });

      if (!existingUser) {
        throw new NotFoundException(`User '${member_id}' not found`);
      }

      const existingEvent = await this.prismaService.events.findUnique({
        where: { id: event_id },
      });

      if (!existingEvent) {
        throw new NotFoundException(`Event '${event_id}' not found`);
      }

      const existingMember = await this.prismaService.event_members.findFirst({
        where: { user_id: member_id, event_id },
      });

      if (!existingMember) {
        throw new NotFoundException(
          `User '${member_id}' is not a member of event '${event_id}'`,
        );
      }

      if (
        existingMember.status === Member_status.LEFT ||
        existingMember.status === Member_status.KICKED
      ) {
        return {
          message: `User ${member_id} has already left the event ${existingEvent.title} or was kicked from it`,
        };
      }

      await this.prismaService.event_members.update({
        where: {
          event_id_user_id: {
            event_id: existingMember.event_id,
            user_id: existingMember.user_id,
          },
        },
        data: { status: Member_status.LEFT },
      });

      return {
        message: `User ${member_id} has left the event ${existingEvent.title}`,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async kickMember(user_id: string, memberDto: CreateMemberDto) {
    const { event_id, member_id } = memberDto;
    try {
      const existingUser = await this.prismaService.users.findUnique({
        where: { id: user_id },
      });

      if (!existingUser) {
        throw new NotFoundException(`User '${user_id}' not found`);
      }

      const existingEvent = await this.prismaService.events.findUnique({
        where: { id: event_id },
      });

      if (!existingEvent) {
        throw new NotFoundException(`Event '${event_id}' not found`);
      }

      const existingMember = await this.prismaService.event_members.findFirst({
        where: { user_id: member_id, event_id },
      });

      if (!existingMember) {
        throw new NotFoundException(
          `User '${user_id}' is not a member of event '${event_id}'`,
        );
      }

      if (existingMember.status === Member_status.LEFT) {
        throw new ConflictException(`User has already left the event`);
      }

      if (existingMember.status === Member_status.KICKED) {
        throw new ConflictException(
          `User has already been kicked from the event`,
        );
      }

      if (existingEvent.creator_id !== existingUser.id) {
        throw new UnauthorizedException(
          'You do not have the permission to kick a member',
        );
      }

      await this.prismaService.event_members.update({
        where: {
          event_id_user_id: {
            event_id: existingMember.event_id,
            user_id: existingMember.user_id,
          },
        },
        data: { status: Member_status.KICKED },
      });

      return {
        message: `User has been kicked from the event`,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
}
