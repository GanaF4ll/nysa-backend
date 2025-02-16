import { Test, TestingModule } from '@nestjs/testing';
import { FriendsController } from '../../src/friends/friends.controller';
import { FriendsService } from '../../src/friends/friends.service';

describe('FriendsController', () => {
  let controller: FriendsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendsController],
      providers: [FriendsService],
    }).compile();

    controller = module.get<FriendsController>(FriendsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
