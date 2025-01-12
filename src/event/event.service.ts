import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/db/prisma.service';
import { ResponseType } from 'src/interfaces/response-type';

@Injectable()
export class EventService {
  constructor(private prismaService: PrismaService) {}

  async create(
    creator_id,
    createEventDto: CreateEventDto,
  ): Promise<ResponseType> {
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
      return { message: 'Event created successfully', status: 201 };
    }

    throw new BadRequestException('Event not created');
  }

  async findAll(): Promise<ResponseType> {
    const events = await this.prismaService.event.findMany();

    if (!events) {
      throw new NotFoundException('No events found');
    }

    return { message: 'Events found', data: events, status: 200 };
  }

  async findOne(id: string): Promise<ResponseType> {
    const event = this.prismaService.event.findUnique({ where: { id } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return { message: 'Event found', data: event, status: 200 };
  }

  async findByCreator(creator_id: string): Promise<ResponseType> {
    const creator = await this.prismaService.user.findUnique({
      where: { id: creator_id },
    });

    if (!creator) {
      throw new NotFoundException(`No user found with id ${creator_id}`);
    }

    const events = await this.prismaService.event.findMany({
      where: { creator_id },
    });

    if (!events || events.length === 0) {
      throw new NotFoundException(
        `No events found for the user with id ${creator_id}`,
      );
    }

    return { message: 'Events found', data: events, status: 200 };
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
  ): Promise<ResponseType> {
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
      return {
        message: 'Event updated successfully',
        data: updatedEvent,
        status: 200,
      };
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

  async remove(id: string): Promise<ResponseType> {
    const existingEvent = await this.findOne(id);

    await this.prismaService.event.delete({ where: { id } });

    return { message: `Event with id ${id} has been deleted` };
  }
}
