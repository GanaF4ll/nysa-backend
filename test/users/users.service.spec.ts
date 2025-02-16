import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/db/prisma.service';
import { ImageService } from 'src/events/image/image.service';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Sex } from '@prisma/client';

// Mock argon2
jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  verify: jest.fn().mockResolvedValue(true),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let imageService: ImageService;

  const mockPrismaService = {
    users: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockImageService = {
    createUserImage: jest.fn(),
    getProfilePic: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
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

    service = module.get<UsersService>(UsersService);
    module.get<PrismaService>(PrismaService);
    module.get<ImageService>(ImageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const createUserDto = {
      email: 'test@test.com',
      password: 'password123',
      firstname: 'john',
      lastname: 'doe',
      birthdate: '1990-01-01',
      sex: Sex.MALE,
      phone: '1234567890',
      bio: 'test bio',
    };

    it('should create a new user successfully', async () => {
      mockPrismaService.users.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.users.create.mockResolvedValueOnce({
        id: '1',
        ...createUserDto,
      });
      mockImageService.createUserImage.mockResolvedValueOnce({
        data: 'image-url',
      });

      const result = await service.createUser(createUserDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.users.create).toHaveBeenCalled();
      expect(result.firstname).toBe('john');
      expect(result.lastname).toBe('doe');
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.users.findUnique.mockResolvedValueOnce({ id: '1' });

      await expect(service.createUser(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        firstname: 'John',
      };
      const select = {
        id: true,
        firstname: true,
        lastname: true,
        name: true,
        bio: true,
        image_url: true,
      };

      mockPrismaService.users.findUnique.mockResolvedValueOnce(mockUser);
      mockImageService.getProfilePic.mockResolvedValueOnce('image-url');

      const result = await service.findOne('1', select);

      expect(result.data).toBeDefined();
      expect(result.status).toBe(200);
      expect(result.data.image_url).toBe('image-url');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.users.findUnique.mockResolvedValueOnce(null);

      const select = {
        id: true,
        firstname: true,
        lastname: true,
        name: true,
        bio: true,
        image_url: true,
        email: true,
        phone: true,
        birthdate: true,
        sex: true,
        active: true,
        type: true,
      };
      await expect(service.findOne('1', select)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePassword', () => {
    const updatePasswordDto = {
      oldPassword: 'oldPassword',
      newPassword: 'newPassword',
    };

    it('should update password successfully', async () => {
      mockPrismaService.users.findUnique.mockResolvedValueOnce({
        id: '1',
        password: 'hashedOldPassword',
      });
      mockPrismaService.users.update.mockResolvedValueOnce({ id: '1' });

      const result = await service.updatePassword('1', updatePasswordDto);

      expect(result.message).toBe('User password updated successfully');
      expect(mockPrismaService.users.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException if old password is invalid', async () => {
      mockPrismaService.users.findUnique.mockResolvedValueOnce({
        id: '1',
        password: 'hashedOldPassword',
      });
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.updatePassword('1', updatePasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deactivate', () => {
    it('should deactivate user successfully', async () => {
      mockPrismaService.users.findUnique.mockResolvedValueOnce({ id: '1' });
      mockPrismaService.users.update.mockResolvedValueOnce({
        id: '1',
        active: false,
      });

      const result = await service.deactivate('1');

      expect(result).toBe('User 1 has been deactivated');
      expect(mockPrismaService.users.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { active: false },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.users.findUnique.mockResolvedValueOnce(null);

      await expect(service.deactivate('1')).rejects.toThrow(NotFoundException);
    });
  });
});
