import { CreateAuthDto } from './../auth/dto/create-auth.dto';
import { ConflictException, Injectable } from '@nestjs/common';
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

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const newUser = await this.prismaService.user.create({
      data: {
        auth_id: createUserDto.auth_id,
        firstname: createUserDto.firstname,
        lastname: createUserDto.lastname,
        birthdate: createUserDto.birthdate,
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
    return `This action returns all users`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
