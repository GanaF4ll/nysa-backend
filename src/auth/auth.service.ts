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
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { CreateOrganisationDto } from 'src/user/dto/create-organisation.dto';
import { RegisterUserDto } from './dto/register-user.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaservice: PrismaService,
    private readonly jwt: JwtService,
    private readonly userService: UserService,
  ) {}

  async register(registerDto: RegisterUserDto) {
    let newUser;
    if (registerDto.type === 'USER') {
      newUser = await this.userService.createUser(
        registerDto.data as CreateUserDto,
      );
    } else if (registerDto.type === 'ORGANISATION') {
      newUser = await this.userService.createOrganisation(
        registerDto.data as CreateOrganisationDto,
      );
    } else {
      throw new BadRequestException('Invalid user type');
    }
    const payload = { email: newUser.email, id: newUser.id };

    return {
      access_token: this.jwt.sign(payload),
    };
  }
  // async login(loginDto: LoginDto) {
  //   const { email, password } = loginDto;
  //   const user = await this.userService.findUnique({
  //     where: { email },
  //   });
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }
  //   const isPasswordValid = await argon2.verify(user.password, password);
  //   if (!isPasswordValid) {
  //     throw new BadRequestException('Invalid credentials');
  //   }
  //   const payload = { email: user.email, id: user.id };
  //   return {
  //     access_token: this.jwt.sign(payload),
  //   };
  // }
  // async findAll() {
  //   const users = await this.prismaservice.auth.findMany();
  //   return users;
  // }
  // async findOne(id: string) {
  //   const user = await this.prismaservice.auth.findUnique({
  //     where: { id },
  //   });
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }
  //   return user;
  // }
  // async update(id: string, updateAuthDto: UpdateAuthDto) {
  //   const existingUser = await this.findOne(id);
  //   if (!existingUser) {
  //     throw new NotFoundException('User not found');
  //   }
  //   if (updateAuthDto.password) {
  //     updateAuthDto.password = await argon2.hash(updateAuthDto.password);
  //   }
  //   const updatedUser = await this.prismaservice.auth.update({
  //     where: { id },
  //     data: updateAuthDto,
  //   });
  //   return updatedUser;
  // }
  // async remove(id: string) {
  //   const existingUser = await this.findOne(id);
  //   if (!existingUser) {
  //     throw new NotFoundException('User not found');
  //   }
  //   const deletedUser = await this.prismaservice.auth.delete({
  //     where: { id },
  //   });
  //   return deletedUser;
  // }
}
