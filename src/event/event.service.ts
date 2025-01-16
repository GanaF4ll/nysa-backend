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
import { Prisma, Event } from '@prisma/client';
import { EventFilterDto } from './dto/event-filter.dto';
import { ImageService } from './image/image.service';
import { CreateImageDto } from './image/dto/create-image.dto';

@Injectable()
export class EventService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly imageService: ImageService,
  ) {}

  async create(
    creator_id,
    createEventDto: CreateEventDto,
    event_images?: CreateImageDto[],
  ): Promise<ResponseType> {
    try {
      const { start_time, end_time, ...data } = createEventDto;
      const existingUser = await this.prismaService.user.findUnique({
        where: { id: creator_id },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      if (existingUser.active !== true) {
        throw new UnauthorizedException('User is not active');
      }

      const eventStartTime = new Date(start_time);
      const eventEndTime = new Date(end_time);

      const currentDate = new Date();
      if (eventStartTime < currentDate) {
        throw new BadRequestException('Event date cannot be in the past');
      }

      if (eventEndTime < eventStartTime) {
        throw new BadRequestException('End time cannot be before start time');
      }

      const newEvent = await this.prismaService.event.create({
        data: {
          creator_id,
          start_time: eventStartTime.toISOString(),
          end_time: eventEndTime.toISOString(),
          ...data,
        },
      });

      // ? Vérifie si event_images existe et est un tableau
      if (event_images && Array.isArray(event_images)) {
        for (let i = 0; i < event_images.length; i++) {
          event_images[i].order = i + 1;
          await this.imageService.create(newEvent.id, event_images[i]);
          console.log(`image ${i} created`);
        }
      }

      if (newEvent) {
        return { message: 'Event created successfully', status: 201 };
      }
    } catch (error) {
      console.error('Error creating event:', error);
      throw new BadRequestException(error.message);
    }
  }

  async findAll(filters: EventFilterDto): Promise<{
    events: Event[];
    nextCursor: string | null;
    limit: number;
  }> {
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
    } = filters;

    const conditions: Prisma.Sql[] = [Prisma.sql`WHERE 1=1`];
    let distanceSelect = Prisma.sql``;
    let orderBy = Prisma.sql`ORDER BY start_time ASC, id ASC`;

    if (cursor) {
      try {
        const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');
        const [timestamp, id] = decodedCursor.split('_');
        const cursorDate = new Date(timestamp);

        if (!isNaN(cursorDate.getTime())) {
          conditions.push(
            Prisma.sql`AND (
              start_time > ${cursorDate}::timestamp 
              OR (start_time = ${cursorDate}::timestamp AND id > ${id})
            )`,
          );
        }
      } catch (error) {
        console.error('Erreur lors du décodage du curseur:', error);
        // En cas d'erreur de décodage, on continue sans le curseur
      }
    }

    if (minStart) {
      conditions.push(
        Prisma.sql`AND start_time >= ${new Date(minStart)}::timestamp`,
      );
    }
    if (maxStart) {
      conditions.push(
        Prisma.sql`AND start_time <= ${new Date(maxStart)}::timestamp`,
      );
    }
    if (visibility) {
      conditions.push(Prisma.sql`AND visibility::text = ${visibility}::text`);
    }
    if (minEntryFee !== undefined) {
      conditions.push(Prisma.sql`AND entry_fee >= ${minEntryFee}`);
    }
    if (maxEntryFee !== undefined) {
      conditions.push(Prisma.sql`AND entry_fee <= ${maxEntryFee}`);
    }

    // Gestion de la distance
    if (latitude && longitude) {
      distanceSelect = Prisma.sql`,
        public.ST_Distance(
          public.ST_Transform(public.ST_SetSRID(public.ST_MakePoint(longitude, latitude), 4326), 3857),
          public.ST_Transform(public.ST_SetSRID(public.ST_MakePoint(${longitude}, ${latitude}), 4326), 3857)
        ) as distance`;

      orderBy = Prisma.sql`ORDER BY distance ASC NULLS LAST, start_time ASC, id ASC`;

      if (maxDistance) {
        conditions.push(Prisma.sql`AND
          public.ST_Distance(
            public.ST_Transform(public.ST_SetSRID(public.ST_MakePoint(longitude, latitude), 4326), 3857),
            public.ST_Transform(public.ST_SetSRID(public.ST_MakePoint(${longitude}, ${latitude}), 4326), 3857)
          ) <= ${maxDistance * 1000}`);
      }
    }

    // Combiner toutes les conditions
    const whereConditions = Prisma.sql`${Prisma.join(conditions, ' ')}`;

    // Requête principale
    const events = await this.prismaService.$queryRaw<Event[]>`
      SELECT *${distanceSelect}
      FROM "Event"
      ${whereConditions}
      ${orderBy}
      LIMIT ${limit + 1}
    `;

    // Gestion du curseur suivant
    let nextCursor: string | null = null;
    if (events.length > limit) {
      const lastEvent = events[limit - 1];
      const cursorValue = `${lastEvent.start_time.toISOString()}_${lastEvent.id}`;
      nextCursor = Buffer.from(cursorValue).toString('base64');
      events.pop(); // Retire l'élément supplémentaire
    }

    return {
      events,
      nextCursor,
      limit,
    };
  }

  async findOne(id: string): Promise<ResponseType> {
    const event = this.prismaService.event.findUnique({ where: { id } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    console.log('event', event);
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
    const { start_time, end_time, ...data } = updateEventDto;
    const existingEvent = await this.prismaService.event.findUnique({
      where: { id },
    });
    const currentDate = new Date();

    if (start_time && end_time) {
      const eventStartTime = new Date(start_time);
      const eventEndTime = new Date(end_time);

      if (eventStartTime < currentDate) {
        throw new BadRequestException('Event date cannot be in the past');
      }

      if (eventEndTime < eventStartTime) {
        throw new BadRequestException('End time cannot be before start time');
      }
    }

    if (start_time && !end_time) {
      const eventStartTime = new Date(start_time);
      if (eventStartTime < currentDate) {
        throw new BadRequestException('Event date cannot be in the past');
      }
    }

    if (end_time && !start_time) {
      const eventEndTime = new Date(end_time);
      if (eventEndTime < currentDate) {
        throw new BadRequestException('Event date cannot be in the past');
      }

      if (eventEndTime < existingEvent.start_time) {
        throw new BadRequestException('End time cannot be before start time');
      }
    }

    const updatedEvent = await this.prismaService.event.update({
      data: {
        ...updateEventDto,
      },
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

  async remove(id: string): Promise<ResponseType> {
    const existingEvent = await this.findOne(id);

    await this.prismaService.event.delete({ where: { id } });

    return { message: `Event with id ${id} has been deleted` };
  }
}
