import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateAuthDto, LoginDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/db/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
@Injectable()
export class AuthService {
  constructor(
    private prismaservice: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;
    const existingUser = await this.prismaservice.auth.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await argon2.hash(password);
    const user = await this.prismaservice.auth.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return user;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prismaservice.auth.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    // Générer et retourner le token JWT
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwt.sign(payload),
    };
  }

  async findAll() {
    const users = await this.prismaservice.auth.findMany();

    return users;
  }

  async findOne(id: string) {
    const user = await this.prismaservice.auth.findUnique({
      where: { id },
    });

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

  async remove(id: string) {
    const existingUser = await this.findOne(id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const deletedUser = await this.prismaservice.auth.delete({
      where: { id },
    });

    return deletedUser;
  }
}
