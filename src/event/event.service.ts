import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/db/prisma.service';
import { PaginatedResponse } from 'src/interface/paginated-response';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(private prismaService: PrismaService) {}

  async create(creator_id, createEventDto: CreateEventDto) {
    const { date, ...data } = createEventDto;
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: creator_id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (existingUser.active !== true) {
      throw new UnauthorizedException('User is not active');
    }

    const eventDate = new Date(date);
    const currentDate = new Date();
    if (eventDate < currentDate) {
      throw new BadRequestException('Event date cannot be in the past');
    }

    const newEvent = await this.prismaService.event.create({
      data: {
        creator_id,
        date: eventDate.toISOString(),
        ...data,
      },
    });

    if (newEvent) {
      return 'Event created successfully';
    }

    throw new BadRequestException('Event not created');
  }

  async findAll(params: {
    offset?: number;
    limit?: number;
    cursor?: Prisma.EventWhereUniqueInput;
    where?: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithRelationInput;
  }): Promise<PaginatedResponse<Event>> {
    const { offset = 0, limit = 10, cursor, where, orderBy } = params;

    const [data, total] = await Promise.all([
      this.prismaService.event.findMany({
        skip: offset,
        take: limit,
        cursor,
        where,
        orderBy,
      }),
      this.prismaService.event.count({ where }),
    ]);

    const currentPage = Math.floor(offset / limit) + 1;
    const lastPage = Math.ceil(total / limit);
    const hasNextPage = offset + limit < total;

    return {
      data,
      meta: {
        total,
        page: currentPage,
        lastPage,
        hasNextPage,
      },
    };
  }

  async findOne(id: string) {
    const event = this.prismaService.event.findUnique({ where: { id } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async findByCreator(creator_id: string) {
    const creator = await this.prismaService.user.findUnique({
      where: { id: creator_id },
    });

    const events = this.prismaService.event.findMany({ where: { creator_id } });

    if (!events) {
      throw new NotFoundException(
        `No events found for the user with id ${creator_id}`,
      );
    }

    return events;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const existingEvent = await this.findOne(id);

    if (updateEventDto.date) {
      const eventDate = new Date(updateEventDto.date);
      const currentDate = new Date();
      if (eventDate < currentDate) {
        throw new BadRequestException('Event date cannot be in the past');
      }
    }

    const updatedEvent = await this.prismaService.event.update({
      data: { ...updateEventDto },
      where: { id },
    });

    if (updatedEvent) {
      return 'Event updated successfully';
    } else {
      throw new BadRequestException('Event not updated');
    }
  }

  // async disableEvent(id: string) {
  //   const existingEvent = await this.findOne(id);

  //   const disabledEvent = await this.prismaService.event.update({
  //     data: { active: false },
  //     where: { id },
  //   });

  //   return disabledEvent;
  // }

  async remove(id: string) {
    const existingEvent = await this.findOne(id);

    await this.prismaService.event.delete({ where: { id } });

    return `Event with id ${id} has been deleted`;
  }
}
