import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';
import { CreateGoogleUserDto } from 'src/users/dto/create-google-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UpdatePasswordDto } from 'src/users/dto/update-password.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    createGoogleUser: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findOneByEmail: jest.fn(),
    update: jest.fn(),
    updatePassword: jest.fn(),
    deactivate: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = {
    id: '1',
    email: 'test@test.com',
    name: 'Test User',
    password: 'hashedPassword',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createGoogleUser', () => {
    it('should create a user with Google account', async () => {
      const dto: CreateGoogleUserDto = {
        email: 'test@test.com',
        firstname: 'Test User',
        provider: 'GOOGLE',
      };
      mockUsersService.createGoogleUser.mockResolvedValue(mockUser);

      const result = await controller.createGoogleUser(dto);

      expect(result).toEqual(mockUser);
      expect(service.createGoogleUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);

      const result = await controller.findAll();

      expect(result).toEqual([mockUser]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('findMe', () => {
    it('should return the authenticated user', async () => {
      const mockRequest = {
        user: { id: '1' },
      };
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findMe(mockRequest as any);

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);

      const result = await controller.findOneByEmail('test@test.com');

      expect(result).toEqual(mockUser);
      expect(service.findOneByEmail).toHaveBeenCalledWith('test@test.com');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const mockRequest = {
        user: { id: '1' },
      };
      const updateDto: UpdateUserDto = {
        firstname: 'Updated Name',
      };
      mockUsersService.update.mockResolvedValue({ ...mockUser, ...updateDto });

      const result = await controller.update(mockRequest as any, updateDto);

      expect(result).toEqual({ ...mockUser, ...updateDto });
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const mockRequest = {
        user: { id: '1' },
      };
      const updatePasswordDto: UpdatePasswordDto = {
        oldPassword: 'oldPass',
        newPassword: 'newPass',
      };
      mockUsersService.updatePassword.mockResolvedValue(mockUser);

      const result = await controller.updatePassword(
        mockRequest as any,
        updatePasswordDto,
      );

      expect(result).toEqual(mockUser);
      expect(service.updatePassword).toHaveBeenCalledWith(
        '1',
        updatePasswordDto,
      );
    });
  });

  describe('deactivate', () => {
    it('should deactivate a user', async () => {
      const mockRequest = {
        user: { id: '1' },
      };
      mockUsersService.deactivate.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      const result = await controller.deactivate(mockRequest as any);

      expect(result).toEqual({ ...mockUser, isActive: false });
      expect(service.deactivate).toHaveBeenCalledWith('1');
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const mockRequest = {
        user: { id: '1' },
      };
      mockUsersService.remove.mockResolvedValue(mockUser);

      const result = await controller.remove(mockRequest as any);

      expect(result).toEqual(mockUser);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
