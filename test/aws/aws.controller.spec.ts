import { Test, TestingModule } from '@nestjs/testing';
import { AwsController } from 'src/aws/aws.controller';
import { AwsService } from 'src/aws/aws.service';
import { HttpStatus, UnprocessableEntityException } from '@nestjs/common';

describe('AwsController', () => {
  let controller: AwsController;
  let awsService: AwsService;

  const mockAwsService = {
    upload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AwsController],
      providers: [
        {
          provide: AwsService,
          useValue: mockAwsService,
        },
      ],
    }).compile();

    controller = module.get<AwsController>(AwsController);
    awsService = module.get<AwsService>(AwsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should successfully upload a valid file', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test file content'),
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
      } as Express.Multer.File;

      jest.spyOn(Date.prototype, 'getTime').mockReturnValue(123456789);
      mockAwsService.upload.mockResolvedValue({
        message: '123456789_test.jpg',
      });

      await controller.uploadFile(mockFile);

      expect(mockAwsService.upload).toHaveBeenCalledWith(
        'users',
        '123456789_test.jpg',
        mockFile.buffer,
      );
    });

    it('should throw UnprocessableEntityException for invalid file type', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test file content'),
        mimetype: 'application/pdf',
        size: 1024 * 1024,
      } as Express.Multer.File;

      await expect(controller.uploadFile(mockFile)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw UnprocessableEntityException for file size exceeding limit', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test file content'),
        mimetype: 'image/jpeg',
        size: 11 * 1024 * 1024, // 11MB (exceeds 10MB limit)
      } as Express.Multer.File;

      await expect(controller.uploadFile(mockFile)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should handle AWS upload errors', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test file content'),
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
      } as Express.Multer.File;

      mockAwsService.upload.mockRejectedValue(new Error('Upload failed'));

      await expect(controller.uploadFile(mockFile)).rejects.toThrow(
        Error('Upload failed'),
      );
    });
  });
});
