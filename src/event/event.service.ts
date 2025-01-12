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
import { PaginatedResponse } from 'src/interface/paginated-response';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(private prismaService: PrismaService) {}

  async create(
    creator_id,
    createEventDto: CreateEventDto,
  ): Promise<ResponseType> {
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

    if (newEvent) {
      return { message: 'Event created successfully', status: 201 };
    }

    throw new BadRequestException('Event not created');
  }


  async findAll(params: {
    offset?: number;
    limit?: number;
    cursor?: Prisma.EventWhereUniqueInput;
    where?: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithRelationInput;
    latitude?: number;
    longitude?: number;
    maxDistance?: number; // en mètres
  }): Promise<PaginatedResponse<Event>> {
    const {
      offset = 0,
      limit = 10,
      cursor,
      where,
      orderBy,
      latitude,
      longitude,
      maxDistance,
    } = params;

    if (latitude && longitude && maxDistance) {
      const whereClause = where
        ? sql`AND (${sql.join(
            Object.keys(where).map(
              (key) => sql`${sql.raw(`"${key}"`)} = ${where[key]}`,
            ),
            sql` AND `,
          )})`
        : sql``;

      const events = await this.prismaService.$queryRaw<Event[]>(sql`
        SELECT *, 
               ST_DistanceSphere(
                 ST_MakePoint(longitude, latitude), 
                 ST_MakePoint(${longitude}, ${latitude})
               ) AS distance
        FROM "Event"
        WHERE 1 = 1
          ${whereClause}
          AND ST_DistanceSphere(
                ST_MakePoint(longitude, latitude), 
                ST_MakePoint(${longitude}, ${latitude})
              ) <= ${maxDistance}
        ORDER BY ${orderBy ? sql`${sql.raw(`"${Object.keys(orderBy)[0]}"`)} ${sql.raw(Object.values(orderBy)[0])}` : sql`distance`}
        LIMIT ${limit}
        OFFSET ${offset}
      `);

      const totalResult = await this.prismaService.$queryRaw<
        { count: number }[]
      >(sql`
        SELECT COUNT(*) AS count
        FROM "Event"
        WHERE 1 = 1
          ${whereClause}
          AND ST_DistanceSphere(
                ST_MakePoint(longitude, latitude), 
                ST_MakePoint(${longitude}, ${latitude})
              ) <= ${maxDistance}
      `);

      const total = totalResult[0]?.count || 0;

      const currentPage = Math.floor(offset / limit) + 1;
      const lastPage = Math.ceil(total / limit);
      const hasNextPage = offset + limit < total;

      return {
        data: events,
        meta: {
          total,
          page: currentPage,
          lastPage,
          hasNextPage,
        },
      };
    }

    // Cas sans filtre géographique
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
