import { Auth } from './entities/auth.entity';
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/db/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prismaservice: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(createAuthDto: CreateAuthDto): Promise<Auth> {
    const { email, password } = createAuthDto;
    const existingUser = await this.prismaservice.auth.findUnique({ email });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.prismaservice.auth.create({
      data: {
        email,
        password,
      },
    });

    return user;
  }

  async findAll(): Promise<Auth[]> {
    const users = await this.prismaservice.auth.findMany();

    return users;
  }

  async findOne(id: string): Promise<Auth> {
    const user = await this.prismaservice.auth.findUnique({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateAuthDto: UpdateAuthDto) {
    const existingUser = await this.findOne(id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prismaservice.auth.update({
      where: { id },
      data: updateAuthDto,
    });

    return updatedUser;
  }

  async remove(id: string): Promise<Auth> {
    const existingUser = await this.findOne(id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const deletedUser = await this.prismaservice.auth.delete({ where: { id } });

    return deletedUser;
  }
}
