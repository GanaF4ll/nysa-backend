import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { Provider, User_type } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    verifyEmail: jest.fn(),
    verifyToken: jest.fn(),
    validateGoogleUser: jest.fn(),
    googleLogin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user without file', async () => {
      const registerDto = {
        email: 'test@test.com',
        password: 'password',
        firstname: 'John',
        lastname: 'Doe',
        birthdate: new Date().toString(),
        type: User_type.USER,
      };

      const noFile = {} as Express.Multer.File;

      mockAuthService.register.mockResolvedValue({
        access_token: 'mock_token',
      });

      const result = await controller.register(registerDto, noFile);

      expect(result).toEqual({ access_token: 'mock_token' });
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto, {
        file: undefined,
        name: NaN,
      });
    });

    it('should register a new user with file', async () => {
      const registerDto = {
        email: 'test@test.com',
        password: 'password',
        firstname: 'John',
        lastname: 'Doe',
        type: User_type.USER,
      };

      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
      } as Express.Multer.File;

      mockAuthService.register.mockResolvedValue({
        access_token: 'mock_token',
      });

      const result = await controller.register(registerDto, mockFile);

      expect(result).toEqual({ access_token: 'mock_token' });
      expect(mockAuthService.register).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto = {
        email: 'test@test.com',
        password: 'password',
      };

      mockAuthService.login.mockResolvedValue({ access_token: 'mock_token' });

      const result = await controller.login(loginDto);

      expect(result).toEqual({ access_token: 'mock_token' });
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email availability', async () => {
      const verifyMailDto = { email: 'test@test.com' };
      const mockResponse = {
        data: { isAvailable: true },
        message: 'Email is available to use',
      };

      mockAuthService.verifyEmail.mockResolvedValue(mockResponse);

      const result = await controller.verifyEmail(verifyMailDto);

      expect(result).toEqual(mockResponse);
      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(verifyMailDto);
    });
  });

  describe('verifyToken', () => {
    it('should verify token', async () => {
      const mockRequest = {
        user: { id: '1' },
      };

      mockAuthService.verifyToken.mockResolvedValue({ message: true });

      const result = await controller.verifyToken(mockRequest as any);

      expect(result).toEqual({ message: true });
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith('1');
    });
  });

  describe('googleLogin', () => {
    it('should handle Google login', async () => {
      const googleUser = {
        email: 'google@test.com',
        firstname: 'Google',
        lastname: 'User',
        provider: Provider.GOOGLE,
      };

      mockAuthService.validateGoogleUser.mockResolvedValue({
        access_token: 'mock_token',
      });

      const result = await controller.googleLogin(googleUser);

      expect(result).toEqual({ access_token: 'mock_token' });
      expect(mockAuthService.validateGoogleUser).toHaveBeenCalledWith(googleUser);
    });
  });
});
