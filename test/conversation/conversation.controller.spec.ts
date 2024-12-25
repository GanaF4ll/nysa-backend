import { Test, TestingModule } from '@nestjs/testing';
import { ConversationController } from 'src/conversation/conversation.controller';
import { ConversationService } from 'src/conversation/conversation.service';

describe('ConversationController', () => {
  let controller: ConversationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationController],
      providers: [ConversationService],
    }).compile();

    controller = module.get<ConversationController>(ConversationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
