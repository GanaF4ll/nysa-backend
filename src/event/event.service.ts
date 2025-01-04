import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/db/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class EventService {
  constructor(private prismaService: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    const { creator_id, date, ...data } = createEventDto;
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: creator_id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
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

    return newEvent;
  }

  async findAll() {
    const events = this.prismaService.event.findMany();

    if (!events) {
      throw new NotFoundException('No events found');
    }

    return events;
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

    return updatedEvent;
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
