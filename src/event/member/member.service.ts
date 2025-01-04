import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { Member_status } from '@prisma/client';

@Injectable()
export class MemberService {
  constructor(private prismaService: PrismaService) {}

  async addMember(event_id: string, createMemberDto: CreateMemberDto) {
    const { user_id } = createMemberDto;
    const status = Member_status.PENDING;

    const existingEvent = await this.prismaService.event.findUnique({
      where: { id: event_id },
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event '${event_id}' not found`);
    }

    const existingUser = await this.prismaService.user.findUnique({
      where: { id: user_id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User '${user_id}' not found`);
    }

    const existingMember = await this.prismaService.event_member.findFirst({
      where: { user_id, event_id },
    });

    if (!existingMember || existingMember.status != Member_status.ACCEPTED) {
      const newMember = await this.prismaService.event_member.create({
        data: {
          user_id,
          event_id,
          status,
        },
      });

      if (existingMember?.status === Member_status.ACCEPTED) {
        throw new ConflictException('User is already a member of the event');
      }

      // TODO: Notification to user
      return newMember;
    }
  }

  async getMembers(event_id: string) {
    const existingEvent = await this.prismaService.event.findUnique({
      where: { id: event_id },
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event '${event_id}' not found`);
    }

    const members = await this.prismaService.event_member.findMany({
      where: { event_id },
    });

    const memberCount = members.length;

    return { members, memberCount };
  }
}
