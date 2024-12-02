import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/db/prisma.service';
import { SexEnum } from 'src/constants';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { auth_id } = createUserDto;
    const existingUser = await this.prismaService.user.findUnique({
      where: { auth_id },
    });

    // if (existingUser) {
    //   throw new ConflictException('User already exists');
    // }

    const newUser = await this.prismaService.user.create({
      data: {
        auth_id: createUserDto.auth_id,
        firstname: createUserDto.firstname,
        lastname: createUserDto.lastname,
        birthdate: new Date(createUserDto.birthdate),
        sex: createUserDto.sex,
        phone: createUserDto.phone,
        image_url: createUserDto.image_url,
        bio: createUserDto.bio,
        city: createUserDto.city,
      },
    });

    return newUser;
  }
  async findAll() {
    const users = await this.prismaService.user.findMany();

    if (!users) throw new NotFoundException('No users found');

    return users;
  }

  async findOne(auth_id: string) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { auth_id },
    });

    if (!existingUser) throw new NotFoundException('User not found');

    return existingUser;
  }

  async update(auth_id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.findOne(auth_id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prismaService.user.update({
      where: { auth_id },
      data: {
        ...updateUserDto,
      },
    });

    return updatedUser;
  }

  async deactivate(auth_id: string) {
    const existingUser = await this.findOne(auth_id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const deactivatedUser = await this.prismaService.user.update({
      where: { auth_id },
      data: {
        active: false,
      },
    });

    return `User ${auth_id} has been deactivated`;
  }

  async remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
