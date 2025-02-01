import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/db/prisma.service';
import { ResponseType } from 'src/interfaces/response-type';
import { Prisma, Events, User_type } from '@prisma/client';
import {
  event_scope,
  EventFilterDto,
  visibility_filter,
} from './dto/event-filter.dto';
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
      const existingUser = await this.prismaService.users.findUnique({
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

      const newEvent = await this.prismaService.events.create({
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
          await this.imageService.createEventImage(
            newEvent.id,
            event_images[i],
          );
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
    response: Events[];
    nextCursor: string | null;
    totalCount: number;
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
      search,
    } = filters;

    const conditions: Prisma.Sql[] = [Prisma.sql`WHERE 1=1`];
    let distanceSelect = Prisma.sql``;
    let orderBy = Prisma.sql`ORDER BY start_time ASC, id ASC`;
    const today = new Date();

    conditions.push(Prisma.sql`AND start_time >= ${today}::timestamp`);

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
        if (error instanceof HttpException) throw error;
        throw new InternalServerErrorException(error.message);
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

    if (visibility === visibility_filter.DEFAULT || visibility === undefined) {
      conditions.push(Prisma.sql`AND visibility NOT IN ('PRIVATE')`);
    }

    if (visibility === visibility_filter.FRIENDSONLY) {
      conditions.push(Prisma.sql`AND visibility IN ('FRIENDSONLY')`);
    }

    if (visibility === visibility_filter.PRIVATE) {
      conditions.push(Prisma.sql`AND visibility IN ('PRIVATE')`);
    }

    if (visibility === visibility_filter.PUBLIC) {
      conditions.push(Prisma.sql`AND visibility IN ('PUBLIC')`);
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

    if (search) {
      conditions.push(
        Prisma.sql`AND (title ILIKE ${`%${search}%`} OR description ILIKE ${`%${search}%`})`,
      );
    }

    // Combiner toutes les conditions
    const whereConditions = Prisma.sql`${Prisma.join(conditions, ' ')}`;

    // Requête pour compter le total
    const [countResult] = await this.prismaService.$queryRaw<
      [{ total: number }]
    >`
      SELECT COUNT(*) as total
      FROM "Events"
      ${whereConditions}
    `;

    // Requête principale
    const events = await this.prismaService.$queryRaw<Events[]>`
      SELECT id, title, start_time, address, entry_fee, max_participants, visibility ${distanceSelect}
      FROM "Events"
      ${whereConditions}
      ${orderBy}
      LIMIT ${limit + 1}
    `;

    const response = await Promise.all(
      events.slice(0, limit).map(async (event) => {
        let image = await this.imageService.getFirstImageByEventId(event.id);
        if (!image) {
          image = '';
        }
        console.log('image from the map');
        console.log('image', image);
        console.log('image from the map');
        return {
          ...event,
          image,
        };
      }),
    );

    let nextCursor: string | null = null;
    if (events.length > limit) {
      const lastEvent = events[limit - 1];
      const cursorValue = `${lastEvent.start_time.toISOString()}_${lastEvent.id}`;
      nextCursor = Buffer.from(cursorValue).toString('base64');
      events.pop(); // Retire l'élément supplémentaire
    }

    return {
      response,
      nextCursor,
      totalCount: Number(countResult.total),
    };
  }

  async findOne(id: string): Promise<ResponseType> {
    const event = await this.prismaService.events.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        latitude: true,
        longitude: true,
        creator_id: true,
        address: true,
        max_participants: true,
        entry_fee: true,
        start_time: true,
        end_time: true,
        image: false,
        created_at: false,
        updated_at: false,
        visibility: true,
      },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    let images = await this.imageService.getImagesByEventId(id);
    if (!images) {
      images = [];
    }

    const creator = await this.prismaService.users.findUnique({
      where: { id: event.creator_id },
      select: {
        type: true,
        firstname: true,
        name: true,
        created_at: true,
        image_url: true,
      },
    });

    let creatorImage = await this.imageService.getProfilePic(event.creator_id);
    if (!creatorImage) {
      creatorImage = '';
    }
    const eventWithCreator = {
      ...event,
      creatorName:
        creator.type === User_type.USER ? creator.firstname : creator.name,
      creatorDateInscription: creator.created_at,
      creatorImage,
    };

    return {
      message: 'Event found',
      data: { event: eventWithCreator, images },
      status: 200,
    };
  }

  async findByCreator(
    creator_id: string,
    filters: EventFilterDto,
  ): Promise<ResponseType> {
    const {
      limit = 10,
      minStart,
      maxStart,
      visibility,
      minEntryFee,
      maxEntryFee,
      search,
      scope,
    } = filters;

    const creator = await this.prismaService.users.findUnique({
      where: { id: creator_id },
    });

    if (!creator) {
      throw new NotFoundException(`No user found with id ${creator_id}`);
    }

    // Préparation de la requête avec les filtres dynamiques
    const query: any = {
      where: { creator_id },
      select: {
        id: true,
        title: true,
        start_time: true,
        end_time: true,
        address: true,
        entry_fee: true,
        visibility: true,
        created_at: true,
        updated_at: true,
      },
      take: limit,
      orderBy: { start_time: 'asc' },
    };

    const now = new Date();

    if (scope === event_scope.PAST) {
      query.where.start_time = { lt: now };
    } else if (scope === event_scope.UPCOMING) {
      query.where.start_time = { gte: now };
    }

    if (minStart) {
      query.where.start_time = {
        ...(query.where.start_time || {}),
        gte: minStart,
      };
    }
    if (maxStart) {
      query.where.start_time = {
        ...(query.where.start_time || {}),
        lte: maxStart,
      };
    }

    if (visibility && visibility !== visibility_filter.ALL) {
      query.where.visibility = visibility;
    }

    if (search) {
      query.where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minEntryFee !== undefined) {
      query.where.entry_fee = {
        ...(query.where.entry_fee || {}),
        gte: minEntryFee,
      };
    }
    if (maxEntryFee !== undefined) {
      query.where.entry_fee = {
        ...(query.where.entry_fee || {}),
        lte: maxEntryFee,
      };
    }

    const events = await this.prismaService.events.findMany(query);

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
    const existingEvent = await this.prismaService.events.findUnique({
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

    const updatedEvent = await this.prismaService.events.update({
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

    await this.prismaService.events.delete({ where: { id } });

    return { message: `Event with id ${id} has been deleted` };
  }
}
