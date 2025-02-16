import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/db/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User_type, Provider } from '@prisma/client';
import * as argon2 from 'argon2';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let usersService: UsersService;

  const mockPrismaService = {
    users: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUsersService = {
    createUser: jest.fn(),
    createOrganisation: jest.fn(),
    createGoogleUser: jest.fn(),
    findOneByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    module.get<PrismaService>(PrismaService);
    module.get<JwtService>(JwtService);
    module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@test.com',
        password: 'password',
        firstname: 'John',
        lastname: 'Doe',
        birthdate: new Date().toString(),
        type: User_type.USER,
      };

      const mockUser = { id: '1', ...registerDto };
      mockUsersService.createUser.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock_token');

      const result = await service.register(registerDto);

      expect(result).toEqual({ access_token: 'mock_token' });
      expect(mockUsersService.createUser).toHaveBeenCalled();
    });

    it('should register a new organisation', async () => {
      const registerDto = {
        email: 'org@test.com',
        password: 'password',
        name: 'Test Org',
        type: User_type.ORGANISATION,
      };

      const mockOrg = { id: '1', ...registerDto };
      mockUsersService.createOrganisation.mockResolvedValue(mockOrg);
      mockJwtService.sign.mockReturnValue('mock_token');

      const result = await service.register(registerDto);

      expect(result).toEqual({ access_token: 'mock_token' });
      expect(mockUsersService.createOrganisation).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto = {
        email: 'test@test.com',
        password: 'password',
      };

      const hashedPassword = await argon2.hash('password');
      const mockUser = {
        id: '1',
        email: loginDto.email,
        password: hashedPassword,
      };

      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock_token');

      const result = await service.login(loginDto);

      expect(result).toEqual({ access_token: 'mock_token' });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nonexistent@test.com', password: 'password' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyEmail', () => {
    it('should return true when email is available', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      const result = await service.verifyEmail({ email: 'new@test.com' });

      expect(result).toEqual({
        data: { isAvailable: true },
        message: 'Email is available to use',
      });
    });

    it('should return false when email is already used', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue({ id: '1' });

      const result = await service.verifyEmail({ email: 'existing@test.com' });

      expect(result).toEqual({
        data: { isAvailable: false },
        message: 'Email is already used',
      });
    });
  });

  describe('validateGoogleUser', () => {
    it('should validate and return token for new Google user', async () => {
      const googleUser = {
        email: 'google@test.com',
        firstname: 'Google',
        lastname: 'User',
        provider: Provider.GOOGLE,
      };

      mockPrismaService.users.findUnique.mockResolvedValue(null);
      mockUsersService.createGoogleUser.mockResolvedValue({
        id: '1',
        provider: Provider.GOOGLE,
        ...googleUser,
      });
      mockJwtService.sign.mockReturnValue('mock_token');

      const result = await service.validateGoogleUser(googleUser);

      expect(result).toEqual({ access_token: 'mock_token' });
    });
  });
});
