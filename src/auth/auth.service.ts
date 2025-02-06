import { CreateImageDto } from '../events/image/dto/create-image.dto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/db/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateOrganisationDto } from 'src/users/dto/create-organisation.dto';
import { RegisterUserDto } from './dto/register.dto';
import { CreateGoogleUserDto } from 'src/users/dto/create-google-user.dto';
import { VerifyMailDto } from './dto/verify-mail.dto';
import { Provider, User_type } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwt: JwtService,
    private readonly userService: UsersService,
  ) {}

  async register(
    registerDto: RegisterUserDto,
    createImageDto?: CreateImageDto,
  ) {
    let newUser;

    if (registerDto.type === User_type.USER) {
      // Conversion explicite vers CreateUserDto
      const userDto: CreateUserDto = {
        email: registerDto.email!,
        password: registerDto.password!,
        firstname: registerDto.firstname!,
        lastname: registerDto.lastname!,
        birthdate: registerDto.birthdate!,
        bio: registerDto.bio,
        phone: registerDto.phone,
        sex: registerDto.sex,
      };
      if (!createImageDto) {
        newUser = await this.userService.createUser(userDto);
      } else {
        newUser = await this.userService.createUser(userDto, createImageDto);
      }
    } else if (registerDto.type === User_type.ORGANISATION) {
      const organisationDto: CreateOrganisationDto = {
        email: registerDto.email!,
        password: registerDto.password!,
        name: registerDto.name!,
        phone: registerDto.phone,
        bio: registerDto.bio,
      };

      if (!createImageDto) {
        newUser = await this.userService.createOrganisation(organisationDto);
      }
      newUser = await this.userService.createOrganisation(
        organisationDto,
        createImageDto,
      );
    } else {
      throw new BadRequestException('Invalid user type');
    }

    const payload = { id: newUser.id };
    return {
      access_token: this.jwt.sign(payload),
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const formattedEmail = email.toLowerCase();
    const user = await this.userService.findOneByEmail(formattedEmail);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }
    const payload = { id: user.id };
    return {
      access_token: this.jwt.sign(payload),
    };
  }

  async verifyEmail(emailDto: VerifyMailDto) {
    const { email } = emailDto;
    const formattedEmail = email.toLowerCase();
    const user = await this.userService.findOneByEmail(formattedEmail);
    if (!user) {
      return {
        data: { isAvailable: true },
        message: `Email is available to use`,
      };
    }

    return {
      data: { isAvailable: false },
      message: `Email is already used`,
    };
  }

  async validateGoogleUser(googleUser: CreateGoogleUserDto) {
    try {
      let user = await this.prismaService.users.findUnique({
        where: { email: googleUser.email },
      });

      if (!user) {
        user = await this.userService.createGoogleUser(googleUser);
      }

      const payload = { id: user.id };

      if (user.provider !== Provider.GOOGLE) {
        throw new BadRequestException('User already exists');
      }

      return { access_token: this.jwt.sign(payload) };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async googleLogin(id: string) {
    const user = await this.prismaService.users.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const payload = { id: user.id };
    const token = this.jwt.sign(payload);
    return { access_token: token };
  }

  async verifyToken(id: string) {
    const user = await this.prismaService.users.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.active !== true) {
      throw new UnauthorizedException('User not active');
    }
    return { message: true };
  }
}
