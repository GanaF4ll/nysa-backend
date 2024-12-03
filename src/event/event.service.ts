import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/db/prisma.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class EventService {
  constructor(
    private prismaService: PrismaService,
    private authService: AuthService,
  ) {}

  async create(createEventDto: CreateEventDto) {
    const { creator_id, date, ...data } = createEventDto;
    const existingUser = await this.authService.findOne(creator_id);

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

  findAll() {
    return `This action returns all event`;
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
