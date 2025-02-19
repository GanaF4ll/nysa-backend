import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from 'src/events/events.controller';
import { EventsService } from 'src/events/events.service';
import { ImageService } from 'src/events/image/image.service';
import { CreateEventDto } from 'src/events/dto/create-event.dto';
import { UpdateEventDto } from 'src/events/dto/update-event.dto';
import { EventFilterDto } from 'src/events/dto/event-filter.dto';

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: EventsService;
  let imageService: ImageService;

  const mockEventsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByCreator: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getMyMemberships: jest.fn(),
  };

  const mockImageService = {
    getImagesByEventId: jest.fn(),
    createEventImage: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
        {
          provide: ImageService,
          useValue: mockImageService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    eventsService = module.get<EventsService>(EventsService);
    module.get<ImageService>(ImageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const mockCreateEventDto: CreateEventDto = {
      title: 'Test Event',
      description: 'Test Description',
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      address: 'Test Address',
      latitude: 48.8566,
      longitude: 2.3522,
      max_participants: 10,
      entry_fee: 0,
      visibility: 'PUBLIC',
      event_images: [],
    };

    it('should create an event without files', async () => {
      const mockRequest = {
        user: { id: 'user-id' },
      };

      mockEventsService.create.mockResolvedValue({
        message: 'Event created successfully',
        status: 201,
      });

      const result = await controller.create(mockRequest as any, mockCreateEventDto, []);

      expect(result).toEqual({
        message: 'Event created successfully',
        status: 201,
      });
      expect(eventsService.create).toHaveBeenCalledWith('user-id', mockCreateEventDto, []);
    });

    it('should create an event with files', async () => {
      const mockRequest = {
        user: { id: 'user-id' },
      };

      const mockFiles = [
        {
          originalname: 'test.jpg',
          buffer: Buffer.from('test'),
        },
      ];

      mockEventsService.create.mockResolvedValue({
        message: 'Event created successfully',
        status: 201,
      });

      const result = await controller.create(
        mockRequest as any,
        mockCreateEventDto,
        mockFiles as Express.Multer.File[],
      );

      expect(result).toEqual({
        message: 'Event created successfully',
        status: 201,
      });
    });
  });

  describe('findAll', () => {
    it('should return all events', async () => {
      const mockFilters: EventFilterDto = {
        limit: 10,
      };

      const mockEvents = [
        { id: '1', title: 'Event 1' },
        { id: '2', title: 'Event 2' },
      ];

      mockEventsService.findAll.mockResolvedValue({
        data: mockEvents,
        totalCount: 2,
        nextCursor: null,
      });

      const result = await controller.findAll(mockFilters);

      expect(result.data).toEqual(mockEvents);
      expect(result.totalCount).toBe(2);
      expect(eventsService.findAll).toHaveBeenCalledWith(mockFilters);
    });
  });

  describe('findOne', () => {
    it('should return a single event', async () => {
      const mockRequest = {
        user: { id: 'user-id' },
      };

      const mockEvent = {
        id: '1',
        title: 'Test Event',
      };

      mockEventsService.findOne.mockResolvedValue({
        message: 'Event found',
        data: mockEvent,
        status: 200,
      });

      const result = await controller.findOne('1', mockRequest as any);

      expect(result.data).toEqual(mockEvent);
      expect(eventsService.findOne).toHaveBeenCalledWith('1', 'user-id');
    });
  });

  describe('getMyMemberships', () => {
    it('should return user memberships', async () => {
      const mockRequest = {
        user: { id: 'user-id' },
      };

      const mockFilters: EventFilterDto = {
        limit: 10,
      };

      const mockMemberships = [
        { id: '1', title: 'Event 1' },
        { id: '2', title: 'Event 2' },
      ];

      mockEventsService.getMyMemberships.mockResolvedValue(mockMemberships);

      const result = await controller.getMemberships(mockRequest as any, mockFilters);

      expect(result).toEqual(mockMemberships);
      expect(eventsService.getMyMemberships).toHaveBeenCalledWith('user-id', mockFilters);
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Event',
      };

      mockEventsService.update.mockResolvedValue({
        message: 'Event updated successfully',
        status: 200,
      });

      const result = await controller.update('1', updateEventDto);

      expect(result).toEqual({
        message: 'Event updated successfully',
        status: 200,
      });
      expect(eventsService.update).toHaveBeenCalledWith('1', updateEventDto);
    });
  });

  describe('remove', () => {
    it('should remove an event', async () => {
      mockEventsService.remove.mockResolvedValue({
        message: 'Event deleted successfully',
      });

      const result = await controller.remove('1');

      expect(result).toEqual({
        message: 'Event deleted successfully',
      });
      expect(eventsService.remove).toHaveBeenCalledWith('1');
    });
  });
});
