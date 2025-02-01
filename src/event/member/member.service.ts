import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { Member_status } from '@prisma/client';
import {
  event_scope,
  EventFilterDto,
  visibility_filter,
} from '../dto/event-filter.dto';

@Injectable()
export class MemberService {
  constructor(private prismaService: PrismaService) {}

  async addMember(event_id: string, user_id) {
    try {
      const status = Member_status.CONFIRMED;

      const existingEvent = await this.prismaService.events.findUnique({
        where: { id: event_id },
      });

      if (!existingEvent) {
        throw new NotFoundException(`Event '${event_id}' not found`);
      }

      const newGuest = await this.prismaService.users.findUnique({
        where: { id: user_id },
      });

      if (!newGuest) {
        throw new NotFoundException(`User '${user_id}' not found`);
      }

      const existingMember = await this.prismaService.event_members.findFirst({
        where: { user_id, event_id },
      });

      if (!existingMember || existingMember.status === Member_status.LEFT) {
        // * vérifier la visibilité de l'événement

        const newMember = await this.prismaService.event_members.create({
          data: {
            user_id,
            event_id,
            status,
          },
        });

        return {
          message: `User ${user_id} has been added to the event ${existingEvent.title}`,
          data: newMember,
        };

        // TODO: Notification to user
      } else if (existingMember.status === Member_status.CONFIRMED) {
        return {
          message: `User ${user_id} is already a member of the event ${existingEvent.title}`,
        };
      } else if (existingMember.status === Member_status.KICKED) {
        return {
          message: `User ${user_id} has been kicked from the event ${existingEvent.title}`,
        };
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

      const creator = await this.prismaService.users.findUnique({
        where: { id: existingEvent.creator_id },
      });

      const members = await this.prismaService.event_members.findMany({
        where: { event_id },
      });

      // members.forEach(async (member) => {
      //   const user = await this.prismaService.users.findUnique({
      //     where: { id: member.user_id },
      //   });
      // });

      const memberCount = members.length;

      return { members, memberCount };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async getMyMemberships(user_id: string, filters: EventFilterDto) {
    const {
      limit = 10,
      cursor,
      minStart,
      maxStart,
      visibility,
      minEntryFee,
      maxEntryFee,
      latitude,
      longitude,
      maxDistance,
      search,
      scope,
    } = filters;

    try {
      const existingUser = await this.prismaService.users.findUnique({
        where: { id: user_id },
      });

      if (!existingUser) {
        throw new NotFoundException(`User '${user_id}' not found`);
      }

      const memberships = await this.prismaService.event_members.findMany({
        where: { user_id, status: Member_status.CONFIRMED },
      });

      let eventsQuery: any = {
        where: {
          id: { in: memberships.map((membership) => membership.event_id) },
        },
        take: limit,
        orderBy: { start_time: 'asc' },
      };

      const now = new Date();
      if (scope === event_scope.PAST) {
        eventsQuery.where.start_time = { lt: now };
      } else if (scope === event_scope.UPCOMING) {
        eventsQuery.where.start_time = { gte: now };
      }

      if (minStart) {
        eventsQuery.where.start_time = {
          ...(eventsQuery.where.start_time || {}),
          gte: minStart,
        };
      }
      if (maxStart) {
        eventsQuery.where.start_time = {
          ...(eventsQuery.where.start_time || {}),
          lte: maxStart,
        };
      }

      if (visibility && visibility !== visibility_filter.ALL) {
        eventsQuery.where.visibility = visibility;
      }

      if (search) {
        eventsQuery.where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (minEntryFee !== undefined) {
        eventsQuery.where.entry_fee = {
          ...(eventsQuery.where.entry_fee || {}),
          gte: minEntryFee,
        };
      }
      if (maxEntryFee !== undefined) {
        eventsQuery.where.entry_fee = {
          ...(eventsQuery.where.entry_fee || {}),
          lte: maxEntryFee,
        };
      }

      if (
        latitude !== undefined &&
        longitude !== undefined &&
        maxDistance !== undefined
      ) {
        const earthRadius = 6371; // Earth's radius in km
        eventsQuery.where.AND = [
          {
            latitude: {
              gte: latitude - (maxDistance / earthRadius) * (180 / Math.PI),
              lte: latitude + (maxDistance / earthRadius) * (180 / Math.PI),
            },
          },
          {
            longitude: {
              gte:
                longitude -
                (maxDistance /
                  (earthRadius * Math.cos((latitude * Math.PI) / 180))) *
                  (180 / Math.PI),
              lte:
                longitude +
                (maxDistance /
                  (earthRadius * Math.cos((latitude * Math.PI) / 180))) *
                  (180 / Math.PI),
            },
          },
        ];
      }

      const events = await this.prismaService.events.findMany(eventsQuery);

      return events;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async leaveEvent(user_id: string, event_id: string) {
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
        where: { user_id, event_id },
      });

      if (!existingMember) {
        throw new NotFoundException(
          `User '${user_id}' is not a member of event '${event_id}'`,
        );
      }

      if (
        existingMember.status === Member_status.LEFT ||
        existingMember.status === Member_status.KICKED
      ) {
        return {
          message: `User ${user_id} has already left the event ${existingEvent.title} or was kicked from it`,
        };
      }

      const updatedMember = await this.prismaService.event_members.update({
        where: {
          event_id_user_id: {
            event_id: existingMember.event_id,
            user_id: existingMember.user_id,
          },
        },
        data: { status: Member_status.LEFT },
      });

      return {
        message: `User ${user_id} has left the event ${existingEvent.title}`,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async kickMember(user_id: string, event_id: string, member_id: string) {
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

      if (existingEvent.creator_id !== existingUser.id) {
        throw new UnauthorizedException(
          'You do not have the permission to kick a member',
        );
      }

      if (existingMember.status === Member_status.LEFT) {
        return {
          message: `User ${user_id} has already left the event ${existingEvent.title}`,
        };
      }

      const updatedMember = await this.prismaService.event_members.update({
        where: {
          event_id_user_id: {
            event_id: existingMember.event_id,
            user_id: existingMember.user_id,
          },
        },
        data: { status: Member_status.KICKED },
      });

      return {
        message: `User ${user_id} has been kicked from the event ${existingEvent.title}`,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
}
