import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsController } from 'src/conversations/conversations.controller';
import { ConversationsService } from 'src/conversations/conversations.service';
import { ValidationPipe } from '@nestjs/common';

describe('ConversationsController', () => {
  let controller: ConversationsController;
  let service: ConversationsService;

  const mockConversationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        {
          provide: ConversationsService,
          useValue: mockConversationsService,
        },
      ],
    }).compile();

    controller = module.get<ConversationsController>(ConversationsController);
    module.get<ConversationsService>(ConversationsService);
  });

  describe('create', () => {
    it('should create a conversation', async () => {
      const createDto = {
        name: 'Test Conversation',
        users: ['user-1', 'user-2'],
      };

      const mockRequest = {
        user: { id: 'user-1' },
        body: createDto,
      };

      mockConversationsService.create.mockResolvedValue('Conversation created');

      const result = await controller.create(mockRequest as any, createDto);

      expect(result).toBe('Conversation created');
      expect(mockConversationsService.create).toHaveBeenCalledWith('user-1', createDto);
    });
  });

  describe('findAll', () => {
    it('should return all conversations', async () => {
      const mockResult = ['conversation1', 'conversation2'];
      mockConversationsService.findAll.mockResolvedValue(mockResult);

      expect(await controller.findAll()).toBe(mockResult);
    });
  });

  describe('findOne', () => {
    it('should return one conversation', async () => {
      const mockResult = { id: 1, name: 'Test Conversation' };
      mockConversationsService.findOne.mockResolvedValue(mockResult);

      expect(await controller.findOne('1')).toBe(mockResult);
    });
  });
});
