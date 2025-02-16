import { Test, TestingModule } from '@nestjs/testing';
import { AwsService } from 'src/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { BadRequestException } from '@nestjs/common';
import * as presigner from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('AwsService', () => {
  let service: AwsService;
  let configService: ConfigService;

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      const config = {
        AWS_S3_REGION: process.env.AWS_S3_REGION,
        AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AwsService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AwsService>(AwsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    it('should upload a file successfully', async () => {
      const mockSend = jest.fn().mockResolvedValue({});
      (S3Client as jest.Mock).mockImplementation(() => ({
        send: mockSend,
      }));

      const folder = 'test-folder';
      const filename = 'test-file.jpg';
      const file = Buffer.from('test file content');

      const result = await service.upload(folder, filename, file);

      expect(result).toEqual({ message: filename });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Bucket: 'nysa.app',
            Key: `${folder}/${filename}`,
            Body: file,
          },
        }),
      );
    });

    it('should throw BadRequestException on upload error', async () => {
      const mockSend = jest.fn().mockRejectedValue(new Error('Upload failed'));
      (S3Client as jest.Mock).mockImplementation(() => ({
        send: mockSend,
      }));

      const folder = 'test-folder';
      const filename = 'test-file.jpg';
      const file = Buffer.from('test file content');

      await expect(service.upload(folder, filename, file)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getSignedUrl', () => {
    it('should generate a signed URL successfully', async () => {
      const mockSignedUrl = 'https://signed-url.example.com';
      (presigner.getSignedUrl as jest.Mock).mockResolvedValue(mockSignedUrl);

      const folder = 'test-folder';
      const filename = 'test-file.jpg';
      const expiresIn = 3600;

      const result = await service.getSignedUrl(folder, filename, expiresIn);

      expect(result).toBe(mockSignedUrl);
      expect(presigner.getSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.objectContaining({
          input: {
            Bucket: 'nysa.app',
            Key: `${folder}/${filename}`,
          },
        }),
        { expiresIn },
      );
    });

    it('should throw BadRequestException on getSignedUrl error', async () => {
      (presigner.getSignedUrl as jest.Mock).mockRejectedValue(
        new Error('Signing failed'),
      );

      const folder = 'test-folder';
      const filename = 'test-file.jpg';

      await expect(service.getSignedUrl(folder, filename)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const mockSend = jest.fn().mockResolvedValue({});
      (S3Client as jest.Mock).mockImplementation(() => ({
        send: mockSend,
      }));

      const filename = 'test-file.jpg';

      await service.deleteFile(filename);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Bucket: 'nysa.app',
            Key: filename,
          },
        }),
      );
    });

    it('should throw BadRequestException on delete error', async () => {
      const mockSend = jest.fn().mockRejectedValue(new Error('Delete failed'));
      (S3Client as jest.Mock).mockImplementation(() => ({
        send: mockSend,
      }));

      const filename = 'test-file.jpg';

      await expect(service.deleteFile(filename)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
