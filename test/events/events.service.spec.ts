import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from 'src/events/events.service';
import { PrismaService } from 'src/db/prisma.service';
import { ImageService } from 'src/events/image/image.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from 'src/events/dto/create-event.dto';
import { Events, Member_status, User_type } from '@prisma/client';
import { event_scope, visibility_filter } from 'src/events/dto/event-filter.dto';

describe('EventsService', () => {
  let service: EventsService;
  let prismaService: PrismaService;
  let imageService: ImageService;

  const mockPrismaService = {
    events: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    users: {
      findUnique: jest.fn(),
    },
    event_members: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  const mockImageService = {
    createEventImage: jest.fn(),
    getFirstImageByEventId: jest.fn(),
    getImagesByEventId: jest.fn(),
    getProfilePic: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ImageService,
          useValue: mockImageService,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    module.get<PrismaService>(PrismaService);
    module.get<ImageService>(ImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockCreateEventDto: CreateEventDto = {
      title: 'Test Event',
      description: 'Test Description',
      start_time: new Date(Date.now() + 86400000).toISOString(), // tomorrow
      end_time: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
      address: 'Test Address',
      latitude: 48.8566,
      longitude: 2.3522,
      max_participants: 10,
      entry_fee: 0,
      visibility: 'PUBLIC',
      event_images: [],
    };

    it('should create an event successfully', async () => {
      const creator_id = 'test-user-id';
      mockPrismaService.users.findUnique.mockResolvedValue({
        id: creator_id,
        active: true,
      });
      mockPrismaService.events.create.mockResolvedValue({
        id: 'test-event-id',
        ...mockCreateEventDto,
      });

      const result = await service.create(creator_id, mockCreateEventDto);

      expect(result).toEqual({
        message: 'Event created successfully',
        status: 201,
      });
    });

    it('should throw BadRequestException for past event date', async () => {
      const creator_id = 'test-user-id';
      const pastEventDto = {
        ...mockCreateEventDto,
        start_time: new Date(Date.now() - 86400000).toISOString(), // yesterday
      };

      mockPrismaService.users.findUnique.mockResolvedValue({
        id: creator_id,
        active: true,
      });

      await expect(service.create(creator_id, pastEventDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    const mockEvents: Partial<Events>[] = [
      {
        id: '1',
        title: 'Event 1',
        start_time: new Date(),
        max_participants: 10,
      },
    ];

    it('should return events with pagination', async () => {
      mockPrismaService.$queryRaw.mockResolvedValueOnce([{ total: 1 }]);
      mockPrismaService.$queryRaw.mockResolvedValueOnce(mockEvents);
      mockImageService.getFirstImageByEventId.mockResolvedValue('image-url');
      mockPrismaService.event_members.count.mockResolvedValue(5);

      const result = await service.findAll({
        limit: 10,
        visibility: visibility_filter.PUBLIC,
      });

      expect(result.data).toBeDefined();
      expect(result.totalCount).toBe(1);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe('findOne', () => {
    const mockEvent = {
      id: '1',
      title: 'Test Event',
      creator_id: 'creator-id',
      visibility: 'PUBLIC',
    };

    const mockCreator = {
      type: User_type.USER,
      firstname: 'John',
      name: 'Doe',
      created_at: new Date(),
      image_url: 'profile-pic-url',
    };

    it('should return event details', async () => {
      mockPrismaService.events.findUnique.mockResolvedValue(mockEvent);
      mockPrismaService.users.findUnique.mockResolvedValueOnce({
        id: 'user-id',
      });
      mockPrismaService.users.findUnique.mockResolvedValueOnce(mockCreator);
      mockImageService.getImagesByEventId.mockResolvedValue(['image1', 'image2']);
      mockImageService.getProfilePic.mockResolvedValue('profile-pic-url');
      mockPrismaService.event_members.findMany.mockResolvedValue([]);

      const result = await service.findOne('1', 'user-id');

      expect(result.status).toBe(200);
      expect(result.message).toBe('Event found');
      expect(result.data).toBeDefined();
    });

    it('should throw NotFoundException for non-existent event', async () => {
      mockPrismaService.events.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999', 'user-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMyMemberships', () => {
    it('should return user event memberships', async () => {
      const userId = 'test-user-id';
      mockPrismaService.users.findUnique.mockResolvedValue({ id: userId });
      mockPrismaService.event_members.findMany.mockResolvedValue([
        { event_id: '1', user_id: userId, status: Member_status.CONFIRMED },
      ]);
      mockPrismaService.events.findMany.mockResolvedValue([{ id: '1', title: 'Test Event' }]);

      const result = await service.getMyMemberships(userId, {
        scope: event_scope.UPCOMING,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(service.getMyMemberships('non-existent-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
