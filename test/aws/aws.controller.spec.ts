import { Test, TestingModule } from '@nestjs/testing';
import { AwsController } from '../../src/aws/aws.controller';
import { AwsService } from '../../src/aws/aws.service';

describe('AwsController', () => {
  let controller: AwsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AwsController],
      providers: [AwsService],
    }).compile();

    controller = module.get<AwsController>(AwsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
